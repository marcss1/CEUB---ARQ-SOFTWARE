// const express = require('express');
// const proxy = require('express-http-proxy');
// const app = express();

// const PORT = process.env.PORT || 3000;

// // Endereços dos serviços (por enquanto, simulados)
// // Quando seus colegas terminarem, você substituirá pelas URLs públicas do Railway.
// const SERVER1_URL = 'https://sua-simulacao-server1.free.beeceptor.com'; // Serviço de usuários
// const LOAD_BALANCER_URL = 'http://localhost:4000'; // Endereço do seu futuro Balanceador de Carga

// // Rota para o serviço de usuários (direto no Server1, como exemplo)
// app.use('/users', proxy(SERVER1_URL, {
//   proxyReqPathResolver: (req) => `/users${req.url}` // Repassa a URL completa, ex: /users/123
// }));

// // Todas as outras requisições (ex: /orders, /products) irão para o Balanceador de Carga
// app.use('/', proxy(LOAD_BALANCER_URL));

// app.get('/resources', proxy(servers[currentServer]));

// //balanceador
// let currentServer = 0;

// app.listen(PORT, () => {
//   console.log(`API Gateway rodando na porta ${PORT}`);
// });

// const roundRobin = (req, res, next) => {
//   // Escolhe o servidor atual e já aponta para o próximo
//   const target = servers[currentServer];
//   currentServer = (currentServer + 1) % servers.length;
  
//   // Imprime no console para vermos a mágica acontecer
//   console.log(`Redirecionando para: ${target}`);
  
//   // Usa o proxy para redirecionar a requisição
//   proxy(target)(req, res, next);
// };

// const servers = [
//   'https://simulacao-server1.free.beeceptor.com', // URL do Server1
//   'https://simulacao-replica1.free.beeceptor.com' // URL da Replica1
// ];
