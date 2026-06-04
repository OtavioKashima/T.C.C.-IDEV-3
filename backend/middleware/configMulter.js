// multerConfig.js
const multer = require('multer');
const path = require('path');

// Configuração do armazenamento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Define a pasta onde as fotos serão salvas
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    // Pega a extensão real (.png, .jpg, etc.)
    const extensao = path.extname(file.originalname);
    
    // Como o middleware 'autenticar' roda ANTES desse arquivo nas rotas,
    // o `req.usuarioId` estará disponível aqui perfeitamente!
    const nomeArquivo = Date.now() + "-" + Math.round(Math.random() * 10) + extensao;
    
    cb(null, nomeArquivo);
  }
});

// Criamos a instância do multer com o nosso storage customizado
const upload = multer({ storage: storage });

// 🔴 O SEGREDO: Exportamos diretamente a instância pronta
module.exports = upload;