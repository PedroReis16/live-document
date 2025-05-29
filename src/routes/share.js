const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const ShareController = require('../controllers/shareController');
const { validateShare } = require('../middleware/validation');

// Instanciar o controlador
const shareController = new ShareController();

// Todas as rotas requerem autenticação
router.use(authenticate);

// Rotas de compartilhamento
router.post('/:documentId', validateShare, shareController.shareDocument);
router.get('/:documentId', shareController.getDocumentShares);
router.delete('/:documentId/:userId', shareController.removeShare);
router.put('/:documentId/:userId', validateShare, shareController.updateSharePermission);

module.exports = router;