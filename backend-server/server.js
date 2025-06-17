// server.js - O seu Microsserviço de Recursos com Supabase (PostgreSQL via pg)

const express = require('express');
const { Pool } = require('pg'); // Importa o Pool de conexões do pg
const { v4: uuidv4 } = require('uuid'); // Importa o gerador de UUID
const app = express();
const PORT = process.env.PORT || 4000;

// --- Conexão com o Banco de Dados PostgreSQL (Supabase) ---
// Use variáveis de ambiente para esta string em produção!
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:[trabalhoquarta]@db.frqtqgyewnycqwxbquxl.supabase.co:5432/postgres';
// Substitua 'SUA_SENHA_DO_SUPABASE' e a URL pela sua string de conexão do Supabase

const pool = new Pool({
    connectionString: DATABASE_URL,
    // ssl: { // Necessário para conexão com Supabase (cloud)
    //     rejectUnauthorized: false // Desativar para desenvolvimento, reativar/configurar para produção
    // }
});

// Testar a conexão
pool.query('SELECT NOW()')
    .then(res => console.log('Conectado ao PostgreSQL do Supabase!', res.rows[0]))
    .catch(err => console.error('Erro ao conectar ao PostgreSQL do Supabase:', err));

// --- Middlewares ---
app.use(express.json());

// --- ROTAS DO CRUD ---

// 1. READ (GET All) - Listar todos os recursos
app.get('/resources', async (req, res) => {
    console.log(`[Servidor na porta ${PORT}] Requisição GET /resources recebida.`);
    try {
        const result = await pool.query('SELECT id, name, description, stock FROM resources ORDER BY id');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar recursos do PostgreSQL:', error);
        res.status(500).json({ message: "Erro interno do servidor ao buscar recursos." });
    }
});

// 2. READ (GET by ID) - Buscar um recurso específico
app.get('/resources/:id', async (req, res) => {
    const id = req.params.id;
    console.log(`[Servidor na porta <span class="math-inline">\{PORT\}\] Requisição GET /resources/</span>{id} recebida.`);

    try {
        const result = await pool.query('SELECT id, name, description, stock FROM resources WHERE id = $1', [id]);
        const resource = result.rows[0]; // Pega o primeiro (e único) resultado

        if (resource) {
            res.status(200).json(resource);
        } else {
            res.status(404).json({ message: "Recurso não encontrado." });
        }
    } catch (error) {
        console.error('Erro ao buscar recurso por ID do PostgreSQL:', error);
        res.status(500).json({ message: "Erro interno do servidor ao buscar recurso." });
    }
});

// 3. CREATE (POST) - Criar um novo recurso
app.post('/resources', async (req, res) => {
    console.log(`[Servidor na porta ${PORT}] Requisição POST /resources recebida.`);
    const { name, description, stock } = req.body;

    if (!name || !description || stock === undefined) {
        return res.status(400).json({ message: "Os campos 'name', 'description' e 'stock' são obrigatórios." });
    }
    // Se você não usou DEFAULT gen_random_uuid() na tabela, gere o ID aqui:
    // const id = uuidv4();

    try {
        const result = await pool.query(
            'INSERT INTO resources (name, description, stock) VALUES ($1, $2, $3) RETURNING id, name, description, stock',
            [name, description, stock]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao criar recurso no PostgreSQL:', error);
        // Erros de validação (ex: stock < 0, se você adicionar essa constraint no DB)
        if (error.code === '23502') { // Exemplo de código de erro SQL para NOT NULL violation
             return res.status(400).json({ message: "Dados inválidos: " + error.message });
        }
        res.status(500).json({ message: "Erro interno do servidor ao criar recurso." });
    }
});

// 4. UPDATE (PUT) - Atualização Completa
app.put('/resources/:id', async (req, res) => {
    const id = req.params.id;
    console.log(`[Servidor na porta <span class="math-inline">\{PORT\}\] Requisição PUT /resources/</span>{id} recebida.`);

    const { name, description, stock } = req.body;
    if (!name || !description || stock === undefined) {
        return res.status(400).json({ message: "Para o método PUT, todos os campos ('name', 'description', 'stock') são obrigatórios." });
    }

    try {
        const result = await pool.query(
            'UPDATE resources SET name = $1, description = $2, stock = $3 WHERE id = $4 RETURNING id, name, description, stock',
            [name, description, stock, id]
        );
        const updatedResource = result.rows[0];

        if (updatedResource) {
            res.status(200).json(updatedResource);
        } else {
            res.status(404).json({ message: "Recurso não encontrado para atualização." });
        }
    } catch (error) {
        console.error('Erro ao atualizar recurso (PUT) no PostgreSQL:', error);
        res.status(500).json({ message: "Erro interno do servidor ao atualizar recurso." });
    }
});

// 5. UPDATE (PATCH) - Atualização Parcial
app.patch('/resources/:id', async (req, res) => {
    const id = req.params.id;
    console.log(`[Servidor na porta <span class="math-inline">\{PORT\}\] Requisição PATCH /resources/</span>{id} recebida.`);

    const { name, description, stock } = req.body;
    // Construir a query dinamicamente para PATCH
    let queryParts = [];
    let queryParams = [];
    let paramIndex = 1;

    if (name !== undefined) {
        queryParts.push(`name = $${paramIndex++}`);
        queryParams.push(name);
    }
    if (description !== undefined) {
        queryParts.push(`description = $${paramIndex++}`);
        queryParams.push(description);
    }
    if (stock !== undefined) {
        queryParts.push(`stock = $${paramIndex++}`);
        queryParams.push(stock);
    }

    if (queryParts.length === 0) {
        return res.status(400).json({ message: "Nenhum campo para atualizar foi fornecido." });
    }

    queryParams.push(id); // O ID é sempre o último parâmetro

    try {
        const result = await pool.query(
            `UPDATE resources SET ${queryParts.join(', ')} WHERE id = $${paramIndex} RETURNING id, name, description, stock`,
            queryParams
        );
        const patchedResource = result.rows[0];

        if (patchedResource) {
            res.status(200).json(patchedResource);
        } else {
            res.status(404).json({ message: "Recurso não encontrado para atualização." });
        }
    } catch (error) {
        console.error('Erro ao atualizar recurso (PATCH) no PostgreSQL:', error);
        res.status(500).json({ message: "Erro interno do servidor ao atualizar recurso." });
    }
});
// 6. DELETE - Deletar um recurso
app.delete('/resources/:id', async (req, res) => {
    const id = req.params.id;
    console.log(`[Servidor na porta <span class="math-inline">\{PORT\}\] Requisição DELETE /resources/</span>{id} recebida.`);

    try {
        const result = await pool.query('DELETE FROM resources WHERE id = $1 RETURNING id', [id]);

        if (result.rowCount > 0) { // Verifica se alguma linha foi afetada
            res.status(204).send(); // 204 No Content
        } else {
            res.status(404).json({ message: "Recurso não encontrado para deleção." });
        }
    } catch (error) {
        console.error('Erro ao deletar recurso no PostgreSQL:', error);
        res.status(500).json({ message: "Erro interno do servidor ao deletar recurso." });
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
