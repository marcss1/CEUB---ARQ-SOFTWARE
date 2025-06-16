const express = require('express');
const proxy = require('express-http-proxy');
const app = express();

const PORT = process.env.PORT || 3000;

// Lista de servidores para balanceamento
const servers = [
  'https://simulacao-server1.free.beeceptor.com', // Server1
  'https://simulacao-replica1.free.beeceptor.com' // Replica1
];

// Índice atual do servidor (para round robin)
let currentServer = 0;

// Função Round Robin
const roundRobin = (req, res, next) => {
  // Escolhe o servidor atual
  const target = servers[currentServer];
  
  // Avança para o próximo servidor (circular)
  currentServer = (currentServer + 1) % servers.length;
  
  // Log para acompanhar o balanceamento
  console.log(`Redirecionando para: ${target}`);
  
  // Usa o proxy para redirecionar a requisição
  return proxy(target, {
    proxyReqPathResolver: (req) => req.url // Mantém a URL original
  })(req, res, next);
};

// Middleware para parsing JSON
app.use(express.json());

// ROTAS ESPECÍFICAS COM ROUND ROBIN

// Todas as rotas /resources com qualquer verbo HTTP (GET, POST, PUT, DELETE, etc.)
app.use('/resources', roundRobin);

// ROTA CATCH-ALL para outras possíveis requisições
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint não encontrado',
    message: 'Use /resources ou /resources/:id com os verbos HTTP apropriados'
  });
});

// Rota de health check (não usa round robin)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    servers: servers,
    currentServer: currentServer,
    endpoints: [
      'GET /resources - Listar recursos',
      'POST /resources - Criar recurso',
      'GET /resources/:id - Buscar recurso específico',
      'PUT /resources/:id - Atualizar recurso',
      'DELETE /resources/:id - Deletar recurso'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`API Gateway rodando na porta ${PORT}`);
  console.log(`Servidores configurados: ${servers.join(', ')}`);
});