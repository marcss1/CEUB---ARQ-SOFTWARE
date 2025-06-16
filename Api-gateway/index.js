// api-gateway/index.js - VERSÃO CORRIGIDA E FINAL

const express = require('express');
const proxy = require('express-http-proxy');
const app = express();

const PORT = process.env.PORT || 3000;

// Lista de servidores para balanceamento
const servers = [
  'http://localhost:4000',
  // 'http://localhost:4001' // Você pode adicionar réplicas aqui no futuro
];

// Índice atual do servidor
let currentServer = 0;

// Middleware para o Express entender JSON
app.use(express.json());

// Rota de health check (não usa proxy)
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    servers: servers,
  });
});

// A maneira correta de fazer Round-Robin com esta biblioteca.
// Criamos UM middleware de proxy, e ele resolve o host dinamicamente.
const proxyMiddleware = proxy(() => {
    // 1. Escolhe o servidor de destino
    const target = servers[currentServer];
    
    // 2. Prepara o índice para a PRÓXIMA requisição
    currentServer = (currentServer + 1) % servers.length;
    
    console.log(`[API Gateway] Redirecionando para: ${target}`);
    
    // 3. Retorna o servidor de destino para o proxy usar
    return target;
}, {
    // Esta função garante que a URL original (ex: /resources/2) seja mantida
    proxyReqPathResolver: (req) => {
        return req.originalUrl;
    }
});

// Agora, aplicamos este único middleware a todas as rotas que queremos redirecionar.
app.use('/resources', proxyMiddleware);


// ROTA CATCH-ALL: Esta rota só será acionada se NENHUMA das rotas acima corresponder.
app.use((req, res) => {
  console.log(`[API Gateway] Rota não encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Endpoint não encontrado no Gateway',
    message: 'Use um endpoint válido como /resources ou /resources/:id'
  });
});

app.listen(PORT, () => {
  console.log(`API Gateway (v2 - Corrigido) rodando na porta ${PORT}`);
  console.log(`Servidores de backend configurados: ${servers.join(', ')}`);
});
