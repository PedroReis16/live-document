const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const authenticate = require('../middleware/auth');
const { upload, handleUploadErrors } = require('../middleware/upload');
const { validateProfile, validatePasswordUpdate } = require('../middleware/validation');

// Instanciar o controlador
const userController = new UserController();

// Rotas que não precisam de autenticação
router.get('/profile/:username', userController.getPublicProfile);

// Rotas que precisam de autenticação
router.use(authenticate);
router.get('/me', userController.getCurrentUser);
router.put('/me', validateProfile, userController.updateProfile);
router.put('/me/password', validatePasswordUpdate, userController.updatePassword);
router.post('/me/avatar', upload.single('avatar'), handleUploadErrors, userController.updateAvatar);
router.delete('/me', userController.deleteAccount);

module.exports = router;