const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validation');

// Instanciar o controlador
const authController = new AuthController();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
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
 *           description: Email do usuário (único)
 *         password:
 *           type: string
 *           description: Senha do usuário (será hasheada)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data de criação do usuário
 *       example:
 *         _id: "60d21b4667d0d8992e610c80"
 *         name: "João Silva"
 *         email: "joao@example.com"
 *         createdAt: "2023-05-30T18:51:12.456Z"
 *     AuthResponse:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/User'
 *         token:
 *           type: string
 *           description: Token JWT de autenticação
 *         refreshToken:
 *           type: string
 *           description: Token para renovação da sessão
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registra um novo usuário
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Nome completo do usuário
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email do usuário (único)
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 description: Senha do usuário
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Dados inválidos ou email já em uso
 *       500:
 *         description: Erro do servidor
 */
router.post('/register', validateRegister, authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Autentica um usuário
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email do usuário
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Senha do usuário
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Email ou senha incorretos
 *       500:
 *         description: Erro do servidor
 */
router.post('/login', validateLogin, authController.login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Renova o token de autenticação
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Token de renovação
 *     responses:
 *       200:
 *         description: Token renovado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Novo token JWT de autenticação
 *                 refreshToken:
 *                   type: string
 *                   description: Novo token de renovação
 *       400:
 *         description: Token de renovação ausente
 *       401:
 *         description: Token de renovação inválido ou expirado
 *       500:
 *         description: Erro do servidor
 */
router.post('/refresh', authController.refreshToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Encerra a sessão do usuário
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Token de renovação a ser invalidado
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 *       400:
 *         description: Token de renovação ausente
 *       500:
 *         description: Erro do servidor
 */
router.post('/logout', authController.logout);

module.exports = router;