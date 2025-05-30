const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const authenticate = require('../middleware/auth');
const { upload, handleUploadErrors } = require('../middleware/upload');
const { validateProfile, validatePasswordUpdate } = require('../middleware/validation');

// Instanciar o controlador
const userController = new UserController();

/**
 * @swagger
 * components:
 *   schemas:
 *     PublicProfile:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único do usuário
 *         name:
 *           type: string
 *           description: Nome do usuário
 *         username:
 *           type: string
 *           description: Nome de usuário (único)
 *         avatarUrl:
 *           type: string
 *           description: URL para a imagem de avatar do usuário
 *       example:
 *         _id: "60d21b4667d0d8992e610c80"
 *         name: "João Silva"
 *         username: "joaosilva"
 *         avatarUrl: "https://res.cloudinary.com/demo/image/upload/v1612345678/avatars/user123.jpg"
 *     PrivateProfile:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único do usuário
 *         name:
 *           type: string
 *           description: Nome completo do usuário
 *         email:
 *           type: string
 *           format: email
 *           description: Email do usuário
 *         username:
 *           type: string
 *           description: Nome de usuário (único)
 *         avatarUrl:
 *           type: string
 *           description: URL para a imagem de avatar do usuário
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data de criação do usuário
 *       example:
 *         _id: "60d21b4667d0d8992e610c80"
 *         name: "João Silva"
 *         email: "joao@example.com"
 *         username: "joaosilva"
 *         avatarUrl: "https://res.cloudinary.com/demo/image/upload/v1612345678/avatars/user123.jpg"
 *         createdAt: "2023-05-30T18:51:12.456Z"
 */

/**
 * @swagger
 * /api/users/profile/{username}:
 *   get:
 *     summary: Obtém o perfil público de um usuário pelo nome de usuário
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: Nome de usuário
 *     responses:
 *       200:
 *         description: Perfil público do usuário
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PublicProfile'
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro do servidor
 */
router.get('/profile/:username', userController.getPublicProfile);

// Rotas que precisam de autenticação
router.use(authenticate);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Obtém os dados do usuário atualmente autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário atual
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PrivateProfile'
 *       401:
 *         description: Não autorizado - Token inválido
 *       500:
 *         description: Erro do servidor
 */
router.get('/me', userController.getCurrentUser);

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: Atualiza os dados do perfil do usuário
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome completo atualizado
 *               username:
 *                 type: string
 *                 description: Nome de usuário atualizado
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email atualizado
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PrivateProfile'
 *       400:
 *         description: Dados inválidos ou nome de usuário/email já em uso
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro do servidor
 */
router.put('/me', validateProfile, userController.updateProfile);

/**
 * @swagger
 * /api/users/me/password:
 *   put:
 *     summary: Atualiza a senha do usuário
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 description: Senha atual do usuário
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 description: Nova senha
 *     responses:
 *       200:
 *         description: Senha atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Senha atual incorreta ou usuário não autorizado
 *       500:
 *         description: Erro do servidor
 */
router.put('/me/password', validatePasswordUpdate, userController.updatePassword);

/**
 * @swagger
 * /api/users/me/avatar:
 *   post:
 *     summary: Atualiza a imagem de avatar do usuário
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo de imagem para o avatar
 *     responses:
 *       200:
 *         description: Avatar atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 avatarUrl:
 *                   type: string
 *                   description: URL do novo avatar
 *       400:
 *         description: Formato de arquivo inválido ou erro no upload
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro do servidor
 */
router.post('/me/avatar', upload.single('avatar'), handleUploadErrors, userController.updateAvatar);

/**
 * @swagger
 * /api/users/me:
 *   delete:
 *     summary: Exclui a conta do usuário atual
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conta excluída com sucesso
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro do servidor
 */
router.delete('/me', userController.deleteAccount);

module.exports = router;