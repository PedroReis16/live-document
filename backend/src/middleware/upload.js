const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Garantir que o diretório de upload existe
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração de armazenamento
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // Gerar nome de arquivo único usando timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Filtro de arquivos
const fileFilter = (req, file, cb) => {
  // Aceitar apenas imagens
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido. Envie apenas imagens: jpeg, png, gif ou webp.'), false);
  }
};

// Limites de arquivo
const limits = {
  fileSize: 5 * 1024 * 1024, // 5MB
  files: 1 // Apenas um arquivo por vez
};

// Criar middleware de upload
const upload = multer({
  storage,
  fileFilter,
  limits
});

// Middleware para tratar erros de upload
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Arquivo muito grande. Limite de tamanho é 5MB.'
      });
    }
    
    return res.status(400).json({
      success: false,
      message: `Erro no upload: ${err.message}`
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next();
};

module.exports = {
  upload,
  handleUploadErrors
};