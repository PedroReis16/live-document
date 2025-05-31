const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const ShareController = require('../controllers/shareController');
const { validateShare } = require('../middleware/validation');

// Instanciar o controlador
const shareController = new ShareController();

// Todas as rotas requerem autenticação
router.use(authenticate);

/**
 * @swagger
 * components:
 *   schemas:
 *     SharedDocument:
 *       type: object
 *       required:
 *         - documentId
 *         - sharedById
 *         - sharedWithId
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único do compartilhamento
 *         documentId:
 *           type: string
 *           description: ID do documento compartilhado
 *         sharedById:
 *           type: string
 *           description: ID do usuário que compartilhou o documento
 *         sharedWithId:
 *           type: string
 *           description: ID do usuário com quem o documento foi compartilhado
 *         permissions:
 *           type: string
 *           enum: [read, write, admin]
 *           description: Nível de permissão concedido
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data de criação do compartilhamento
 *       example:
 *         _id: "60d21b4667d0d8992e610c87"
 *         documentId: "60d21b4667d0d8992e610c85"
 *         sharedById: "60d21b4667d0d8992e610c80" 
 *         sharedWithId: "60d21b4667d0d8992e610c81"
 *         permissions: "read"
 *         createdAt: "2023-05-30T18:51:12.456Z"
 */

/**
 * @swagger
 * /api/share/{documentId}:
 *   post:
 *     summary: Compartilha um documento com outro usuário
 *     tags: [Share]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do documento a ser compartilhado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID do usuário com quem compartilhar
 *               permissions:
 *                 type: string
 *                 enum: [read, write, admin]
 *                 default: read
 *                 description: Nível de permissão a conceder
 *     responses:
 *       201:
 *         description: Documento compartilhado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SharedDocument'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Sem permissão para compartilhar este documento
 *       404:
 *         description: Documento ou usuário não encontrado
 *       500:
 *         description: Erro do servidor
 */
router.post('/:documentId', validateShare, shareController.shareDocument);

/**
 * @swagger
 * /api/share/{documentId}:
 *   get:
 *     summary: Obtém todos os compartilhamentos de um documento
 *     tags: [Share]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do documento
 *     responses:
 *       200:
 *         description: Lista de compartilhamentos do documento
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SharedDocument'
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Sem permissão para ver os compartilhamentos deste documento
 *       404:
 *         description: Documento não encontrado
 *       500:
 *         description: Erro do servidor
 */
router.get('/:documentId', shareController.getDocumentShares);

/**
 * @swagger
 * /api/share/{documentId}/{userId}:
 *   delete:
 *     summary: Remove o compartilhamento de um documento com um usuário específico
 *     tags: [Share]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do documento
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do usuário cujo compartilhamento será removido
 *     responses:
 *       200:
 *         description: Compartilhamento removido com sucesso
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Sem permissão para alterar compartilhamentos deste documento
 *       404:
 *         description: Documento, usuário ou compartilhamento não encontrado
 *       500:
 *         description: Erro do servidor
 */
router.delete('/:documentId/:userId', shareController.removeShare);

/**
 * @swagger
 * /api/share/{documentId}/{userId}:
 *   put:
 *     summary: Atualiza as permissões de compartilhamento para um usuário específico
 *     tags: [Share]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do documento
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do usuário cujas permissões serão atualizadas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - permissions
 *             properties:
 *               permissions:
 *                 type: string
 *                 enum: [read, write, admin]
 *                 description: Novo nível de permissão
 *     responses:
 *       200:
 *         description: Permissões atualizadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SharedDocument'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Sem permissão para alterar compartilhamentos deste documento
 *       404:
 *         description: Documento, usuário ou compartilhamento não encontrado
 *       500:
 *         description: Erro do servidor
 */
router.put('/:documentId/:userId', validateShare, shareController.updateSharePermission);

module.exports = router;