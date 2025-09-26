const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBBotzZ05fCpwvRaPJ0Sv1lnIOHtH5FhSI';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const DATA_FILE = path.join(process.cwd(), 'survey-data.json');

exports.handler = async (event, context) => {
    // Headers CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        if (event.httpMethod === 'GET' && event.path === '/.netlify/functions/api/survey') {
            // Rota para obter dados da pesquisa
            const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(data)
            };
        }

        if (event.httpMethod === 'POST' && event.path === '/.netlify/functions/api/analyze') {
            // Rota para análise de dados com IA
            const { question } = JSON.parse(event.body);

            // Ler dados da pesquisa
            const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

            // Preparar prompt para a IA
            const prompt = `Você é um analista de dados de alto nível especializado em estatísticas educacionais.
Analise os seguintes dados de uma pesquisa educacional e responda à pergunta do usuário de forma simples e direta, fornecendo apenas estatísticas relevantes filtradas pelos critérios solicitados.

Dados da pesquisa (formato JSON):
${JSON.stringify(data, null, 2)}

Pergunta do usuário: ${question}

Instruções:
- Forneça apenas estatísticas simples e relevantes.
- Filtre os dados conforme solicitado.
- Seja conciso e direto.
- Os dados são para base de um censo educacional.
- Responda em português brasileiro.`;

            // Chamar a API do Gemini
            const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const analysis = response.text();

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, analysis })
            };
        }

        if (event.httpMethod === 'POST' && event.path === '/.netlify/functions/api/survey') {
            // Rota para receber dados da pesquisa
            const surveyData = JSON.parse(event.body);

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
                timestamp: new Date().toISOString()
            });

            // Salvar dados
            fs.writeFileSync(DATA_FILE, JSON.stringify(existingData, null, 2));

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, message: 'Dados salvos com sucesso' })
            };
        }

        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Rota não encontrada' })
        };

    } catch (error) {
        console.error('Erro:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, message: 'Erro interno do servidor' })
        };
    }
};