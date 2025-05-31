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

/**
 * @swagger
 * /api/share/document/{documentId}/generate-link:
 *   post:
 *     summary: Gera um link compartilhável para um documento
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
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permission:
 *                 type: string
 *                 enum: [read, write, admin]
 *                 default: read
 *                 description: Nível de permissão para o link
 *               expiresIn:
 *                 type: string
 *                 default: "7d"
 *                 description: Tempo de expiração do link (formato compatível com ms)
 *     responses:
 *       200:
 *         description: Link gerado com sucesso
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Sem permissão para compartilhar este documento
 *       404:
 *         description: Documento não encontrado
 *       500:
 *         description: Erro do servidor
 */
router.post('/document/:id/generate-link', shareController.generateShareLink);

/**
 * @swagger
 * /api/share/link/{token}:
 *   get:
 *     summary: Acessa um documento através de um link compartilhado
 *     tags: [Share]
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Token de compartilhamento
 *     responses:
 *       200:
 *         description: Informações do documento associado ao link
 *       404:
 *         description: Link inválido ou expirado
 *       500:
 *         description: Erro do servidor
 */
router.get('/link/:token', shareController.getDocumentByToken);

/**
 * @swagger
 * /api/share/join-by-token:
 *   post:
 *     summary: Entra em um documento através de um token de compartilhamento
 *     tags: [Share]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shareToken
 *             properties:
 *               shareToken:
 *                 type: string
 *                 description: Token de compartilhamento obtido via link ou QRCode
 *     responses:
 *       200:
 *         description: Acesso concedido ao documento
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Link inválido ou expirado
 *       500:
 *         description: Erro do servidor
 */
router.post('/join-by-token', authenticate, shareController.joinByShareToken);

/**
 * @swagger
 * /api/share/{documentId}/collaborators:
 *   get:
 *     summary: Obtém todos os colaboradores de um documento
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
 *         description: Lista de colaboradores do documento
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID do usuário
 *                   name:
 *                     type: string
 *                     description: Nome do usuário
 *                   email:
 *                     type: string
 *                     description: Email do usuário
 *                   avatar:
 *                     type: string
 *                     description: URL do avatar do usuário
 *                   role:
 *                     type: string
 *                     enum: [owner, collaborator]
 *                     description: Papel do usuário no documento
 *                   permission:
 *                     type: string
 *                     enum: [read, write, admin]
 *                     description: Permissão do usuário no documento
 *                   status:
 *                     type: string
 *                     enum: [online, offline]
 *                     description: Status do usuário
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Sem permissão para ver os colaboradores deste documento
 *       404:
 *         description: Documento não encontrado
 *       500:
 *         description: Erro do servidor
 */
router.get('/:documentId/collaborators', shareController.getCollaborators);

/**
 * @swagger
 * /api/share/{documentId}/collaborators/{userId}:
 *   put:
 *     summary: Atualiza a permissão de um colaborador
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
 *         description: ID do usuário colaborador
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - permission
 *             properties:
 *               permission:
 *                 type: string
 *                 enum: [read, write, admin]
 *                 description: Permissão a ser atribuída ao colaborador
 *     responses:
 *       200:
 *         description: Permissão atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Sem permissão para gerenciar colaboradores deste documento
 *       404:
 *         description: Documento ou usuário não encontrado
 *       500:
 *         description: Erro do servidor
 */
router.put('/:documentId/collaborators/:userId', shareController.updateCollaboratorPermission);

/**
 * @swagger
 * /api/share/{documentId}/collaborators/{userId}:
 *   delete:
 *     summary: Remove um colaborador do documento
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
 *         description: ID do usuário colaborador a ser removido
 *     responses:
 *       200:
 *         description: Colaborador removido com sucesso
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Sem permissão para gerenciar colaboradores deste documento
 *       404:
 *         description: Documento ou usuário não encontrado
 *       500:
 *         description: Erro do servidor
 */
router.delete('/:documentId/collaborators/:userId', shareController.removeCollaborator);

module.exports = router;