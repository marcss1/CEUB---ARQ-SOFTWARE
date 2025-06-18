const express = require('express');
const proxy = require('express-http-proxy');
const app = express();

const PORT = process.env.PORT || 3000;

// Lista de servidores para balanceamento
const servers = [
  'https://simulacao-server1.free.beeceptor.com', // Server1
  'https://simulacao-replica1.free.beeceptor.com'  // Replica1
];

// Índice do servidor atual para o round-robin
let currentServer = 0;

/**
 * Middleware de Round Robin
 * Seleciona o próximo servidor da lista de forma circular e redireciona a requisição.
 */
const roundRobin = (req, res, next) => {
  // Este console.log agora deve ser impresso a cada chamada para /resources
  console.log('Middleware roundRobin executado.');

  // Escolhe o servidor de destino
  const target = servers[currentServer];

  // Avança o índice para o próximo servidor, voltando ao início se chegar ao fim da lista
  currentServer = (currentServer + 1) % servers.length;

  console.log(`Redirecionando a requisição de '${req.originalUrl}' para: ${target}`);

  // Usa o 'express-http-proxy' para encaminhar a requisição
  // A requisição original (req) é passada para o middleware do proxy
  return proxy(target, {
    // Mantém o caminho original da URL da requisição
    proxyReqPathResolver: (req) => req.url
  })(req, res, next);
};

// --- CONFIGURAÇÃO DO EXPRESS ---

// Middleware para fazer o parsing do corpo da requisição como JSON
app.use(express.json());


// --- DEFINIÇÃO DAS ROTAS (ORDEM CORRETA) ---

// 1. Rotas mais específicas devem vir primeiro.
// Rota de verificação de status (health check). Não passa pelo balanceador.
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    loadBalancerOnline: true,
    configuredServers: servers,
    endpoints: [
      'GET /health - Verifica o status do API Gateway',
      'GET /resources - Lista todos os recursos (balanceado)',
      'POST /resources - Cria um novo recurso (balanceado)',
      'GET /resources/:id - Busca um recurso específico (balanceado)',
      'PUT /resources/:id - Atualiza um recurso (balanceado)',
      'DELETE /resources/:id - Deleta um recurso (balanceado)'
    ]
  });
});

// 2. Rotas genéricas ou que usam curingas vêm depois.
// Aplica o middleware de round-robin para qualquer requisição em '/resources/*'
app.use('/resources', roundRobin);

// 3. Middlewares de erro ou "catch-all" devem ser os últimos.
// Se nenhuma das rotas acima for correspondida, esta será executada.
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado',
    message: `A rota '${req.originalUrl}' com o método '${req.method}' não existe.`,
    availableRoutes: ['/health', '/resources']
  });
});


// --- INICIALIZAÇÃO DO SERVIDOR ---
app.listen(PORT, () => {
  console.log(`API Gateway (Load Balancer) rodando na porta ${PORT}`);
  console.log(`Servidores configurados para balanceamento: ${servers.join(', ')}`);
});
