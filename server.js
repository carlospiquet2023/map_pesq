const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Arquivo para armazenar os dados
const DATA_FILE = path.join(__dirname, 'survey-data.json');

// Inicializar arquivo de dados se não existir
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// Rota para receber dados da pesquisa
app.post('/api/survey', (req, res) => {
    try {
        const surveyData = req.body;

        // Ler dados existentes
        let existingData = [];
        try {
            existingData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        } catch (error) {
            console.log('Arquivo de dados vazio ou corrompido, iniciando novo');
        }

        // Adicionar novo dado
        existingData.push({
            ...surveyData,
            id: Date.now().toString(),
            ip: req.ip || req.connection.remoteAddress
        });

        // Salvar dados
        fs.writeFileSync(DATA_FILE, JSON.stringify(existingData, null, 2));

        console.log('Nova resposta recebida:', surveyData);
        res.json({ success: true, message: 'Dados salvos com sucesso' });
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
});

// Rota para obter dados (para o painel admin)
app.get('/api/survey', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        res.json(data);
    } catch (error) {
        console.error('Erro ao ler dados:', error);
        res.status(500).json({ success: false, message: 'Erro ao ler dados' });
    }
});

// Rota para servir o painel admin
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log(`Painel admin disponível em http://localhost:${PORT}/admin`);
});