const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY não configurada');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Dados hardcoded para Netlify Functions (temporário)
const DEFAULT_DATA = [
  {
    "idade": "18-24",
    "escolaridade": "medio-incompleto",
    "cidade": "Belford Roxo",
    "bairro": "Santa Amélia",
    "interesse": "ensino-tecnico",
    "inicio": "3-meses",
    "timestamp": "2025-09-26T12:57:39.209Z",
    "id": "1758891459259",
    "ip": "::1"
  }
];

let surveyData = [...DEFAULT_DATA];

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
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(surveyData)
            };
        }

        if (event.httpMethod === 'POST' && event.path === '/.netlify/functions/api/analyze') {
            // Rota para análise de dados com IA
            console.log('Iniciando análise de dados...');
            console.log('GEMINI_API_KEY presente:', !!process.env.GEMINI_API_KEY);

            const { question } = JSON.parse(event.body);
            console.log('Pergunta recebida:', question);

            // Usar dados em memória
            const data = surveyData;
            console.log('Dados disponíveis:', data.length, 'registros');

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

            console.log('Prompt preparado, chamando Gemini...');

            // Chamar a API do Gemini
            const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const analysis = response.text();

            console.log('Análise concluída com sucesso');

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, analysis })
            };
        }

        if (event.httpMethod === 'POST' && event.path === '/.netlify/functions/api/survey') {
            // Rota para receber dados da pesquisa
            const surveyDataInput = JSON.parse(event.body);

            // Adicionar novo dado (dados não persistem em Netlify Functions)
            surveyData.push({
                ...surveyDataInput,
                id: Date.now().toString(),
                timestamp: new Date().toISOString()
            });

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, message: 'Dados salvos com sucesso (não persistente)' })
            };
        }

        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Rota não encontrada' })
        };

    } catch (error) {
        console.error('Erro detalhado:', error);
        console.error('Stack trace:', error.stack);
        console.error('Mensagem do erro:', error.message);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message,
                type: error.constructor.name
            })
        };
    }
};