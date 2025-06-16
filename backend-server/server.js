// server.js - O seu Microsserviço de Recursos

const express = require('express');
const app = express();
// Usaremos uma porta diferente do Gateway, por exemplo, 4000
const PORT = process.env.PORT || 4000;

// --- Banco de Dados em Memória (Para Simulação) ---
// Em uma aplicação real, aqui estariam os seus modelos e a conexão com o banco (MongoDB, PostgreSQL, etc.)
let resources = [
  { id: 1, name: "Item Inicial 1", description: "Este é o primeiro item.", stock: 100 },
  { id: 2, name: "Item Inicial 2", description: "Este é o segundo item.", stock: 50 },
  { id: 3, name: "Item a ser atualizado", description: "Descrição original.", stock: 25 }
];
let nextId = 4; // Para simular o auto-incremento de IDs

// --- Middlewares ---
// Essencial para que o Express consiga interpretar o corpo (body) de requisições em formato JSON
app.use(express.json());

// --- ROTAS DO CRUD ---

// 1. READ (GET All) - Listar todos os recursos
app.get('/resources', (req, res) => {
  console.log(`[Servidor na porta ${PORT}] Requisição GET /resources recebida.`);
  res.status(200).json(resources);
});

// 2. READ (GET by ID) - Buscar um recurso específico
app.get('/resources/:id', (req, res) => {
  const id = parseInt(req.params.id);
  console.log(`[Servidor na porta ${PORT}] Requisição GET /resources/${id} recebida.`);
  
  const resource = resources.find(r => r.id === id);
  
  if (resource) {
    res.status(200).json(resource);
  } else {
    res.status(404).json({ message: "Recurso não encontrado." });
  }
});

// 3. CREATE (POST) - Criar um novo recurso
app.post('/resources', (req, res) => {
  console.log(`[Servidor na porta ${PORT}] Requisição POST /resources recebida.`);
  const { name, description, stock } = req.body;

  // Validação simples
  if (!name || !description || stock === undefined) {
    return res.status(400).json({ message: "Os campos 'name', 'description' e 'stock' são obrigatórios." });
  }

  const newResource = {
    id: nextId++,
    name: name,
    description: description,
    stock: stock
  };

  resources.push(newResource);
  res.status(201).json(newResource);
});

// 4. UPDATE (PUT) - Atualização Completa
// O método PUT substitui o recurso inteiro. Se você não enviar um campo, ele será perdido (ou definido como nulo).
app.put('/resources/:id', (req, res) => {
  const id = parseInt(req.params.id);
  console.log(`[Servidor na porta ${PORT}] Requisição PUT /resources/${id} recebida.`);
  
  // Encontra o índice do recurso no nosso "banco de dados"
  const resourceIndex = resources.findIndex(r => r.id === id);

  // Se o índice for -1, significa que o recurso não foi encontrado
  if (resourceIndex === -1) {
    return res.status(404).json({ message: "Recurso não encontrado para atualização." });
  }

  // Pega os dados do corpo da requisição
  const { name, description, stock } = req.body;

  // Validação para garantir que todos os campos foram enviados
  if (!name || !description || stock === undefined) {
    return res.status(400).json({ message: "Para o método PUT, todos os campos ('name', 'description', 'stock') são obrigatórios." });
  }

  // Cria o novo objeto de recurso atualizado
  const updatedResource = {
    id: id, // Mantém o mesmo id
    name: name,
    description: description,
    stock: stock
  };

  // Substitui o objeto antigo pelo novo no array
  resources[resourceIndex] = updatedResource;

  // Retorna o recurso que foi atualizado
  res.status(200).json(updatedResource);
});


// 5. UPDATE (PATCH) - Atualização Parcial (MAIS RECOMENDADO)
// O método PATCH atualiza apenas os campos que foram enviados na requisição.
app.patch('/resources/:id', (req, res) => {
    const id = parseInt(req.params.id);
    console.log(`[Servidor na porta ${PORT}] Requisição PATCH /resources/${id} recebida.`);
    
    const resourceIndex = resources.findIndex(r => r.id === id);

    if (resourceIndex === -1) {
        return res.status(404).json({ message: "Recurso não encontrado para atualização." });
    }

    // Pega o objeto original
    const originalResource = resources[resourceIndex];

    // Pega as atualizações do corpo da requisição
    const updates = req.body;

    // Mescla o objeto original com as atualizações.
    // Os campos em 'updates' sobrescreverão os campos em 'originalResource'.
    const patchedResource = { ...originalResource, ...updates };

    // Atualiza o recurso no array
    resources[resourceIndex] = patchedResource;

    res.status(200).json(patchedResource);
});


// 6. DELETE - Deletar um recurso
app.delete('/resources/:id', (req, res) => {
    const id = parseInt(req.params.id);
    console.log(`[Servidor na porta ${PORT}] Requisição DELETE /resources/${id} recebida.`);
    
    const initialLength = resources.length;
    // Filtra o array, mantendo todos os recursos EXCETO o que tem o ID correspondente
    resources = resources.filter(r => r.id !== id);

    if (resources.length < initialLength) {
        // Se o tamanho do array diminuiu, a deleção foi bem-sucedida
        res.status(204).send(); // 204 No Content é uma resposta padrão para delete bem-sucedido
    } else {
        res.status(404).json({ message: "Recurso não encontrado para deleção." });
    }
});


// --- Iniciar o Servidor ---
app.listen(PORT, () => {
  console.log(`Servidor de Recursos rodando na porta ${PORT}`);
  console.log('Endpoints disponíveis:');
  console.log('  GET    /resources');
  console.log('  GET    /resources/:id');
  console.log('  POST   /resources');
  console.log('  PUT    /resources/:id  (Atualização completa)');
  console.log('  PATCH  /resources/:id (Atualização parcial)');
  console.log('  DELETE /resources/:id');
});
