const express = require('express');
const router = express.Router();
const DocumentController = require('../controllers/documentController');
const authenticate = require('../middleware/auth');
const { upload, handleUploadErrors } = require('../middleware/upload');
const { validateDocument } = require('../middleware/validation');

// Instanciar controlador
const documentController = new DocumentController();

// Todas as rotas requerem autenticação
router.use(authenticate);

// Rotas de documentos
router.get('/', documentController.getUserDocuments);
router.post('/', validateDocument, documentController.createDocument);
router.get('/:id', documentController.getDocument);
router.put('/:id', documentController.updateDocument);
router.delete('/:id', documentController.deleteDocument);

// Rota de upload de imagem
router.post(
  '/:id/images', 
  upload.single('image'), 
  handleUploadErrors,
  documentController.uploadImage
);

module.exports = router;