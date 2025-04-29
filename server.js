const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const cors = require('cors');  // Importando CORS
const app = express();
const port = 3001;

// Usando CORS para permitir que o frontend acesse o backend
app.use(cors());  // Permite todas as origens

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

// Rota para receber o arquivo (POST)
app.post('/upload', upload.single('file'), (req, res) => {
    console.log('Arquivo recebido:', req.file);  // Log para garantir que o arquivo foi recebido

    if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo foi enviado.' });  // Retorna erro em JSON
    }

    const filePath = req.file.path;  // Caminho do arquivo enviado

    // Ler o arquivo Excel usando XLSX
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);  // Convertendo o conteúdo da planilha para JSON

    // Filtrando as informações necessárias
    const result = data.map(item => ({
        pedido: item['Pedidos de devolução Nº de Pedido da Plataforma'],
        motivoDevolucao: item['Devolução/Razão de Reembolso'],
        status: item['Status na Plataforma']
    }));

    // Resposta em formato JSON
    res.json(result);
});

// Servir o frontend
app.use(express.static('public'));  // Serve os arquivos estáticos do frontend

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
