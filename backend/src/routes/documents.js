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

/**
 * @swagger
 * components:
 *   schemas:
 *     Document:
 *       type: object
 *       required:
 *         - title
 *         - ownerId
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único do documento
 *         title:
 *           type: string
 *           description: Título do documento
 *         content:
 *           type: string
 *           description: Conteúdo do documento em formato string (pode ser JSON ou HTML)
 *         ownerId:
 *           type: string
 *           description: ID do usuário proprietário do documento
 *         collaborators:
 *           type: array
 *           items:
 *             type: string
 *           description: Lista de IDs de usuários colaboradores
 *         isShared:
 *           type: boolean
 *           description: Indica se o documento está compartilhado publicamente
 *         lastEditedBy:
 *           type: string
 *           description: ID do último usuário que editou o documento
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data de criação do documento
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização do documento
 *       example:
 *         _id: "60d21b4667d0d8992e610c85"
 *         title: "Documento de exemplo"
 *         content: "{\"blocks\":[{\"type\":\"paragraph\",\"text\":\"Conteúdo de exemplo\"}]}"

 *         ownerId: "60d21b4667d0d8992e610c80"
 *         collaborators: ["60d21b4667d0d8992e610c81"]
 *         isShared: false
 *         lastEditedBy: "60d21b4667d0d8992e610c80"
 *         createdAt: "2023-05-30T18:51:12.456Z"
 *         updatedAt: "2023-05-30T19:23:45.123Z"
 */

/**
 * @swagger
 * /api/documents:
 *   get:
 *     summary: Obtém todos os documentos do usuário
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de documentos do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Document'
 *       401:
 *         description: Não autorizado - Token inválido
 *       500:
 *         description: Erro do servidor
 */
router.get('/', documentController.getUserDocuments);

/**
 * @swagger
 * /api/documents:
 *   post:
 *     summary: Cria um novo documento
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: Título do documento
 *               content:
 *                 type: string
 *                 description: Conteúdo inicial do documento
 *     responses:
 *       201:
 *         description: Documento criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Document'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro do servidor
 */
router.post('/', validateDocument, documentController.createDocument);

/**
 * @swagger
 * /api/documents/{id}:
 *   get:
 *     summary: Obtém um documento específico por ID
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do documento
 *     responses:
 *       200:
 *         description: Documento encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Document'
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Sem permissão para acessar este documento
 *       404:
 *         description: Documento não encontrado
 *       500:
 *         description: Erro do servidor
 */
router.get('/:id', documentController.getDocument);

/**
 * @swagger
 * /api/documents/{id}:
 *   put:
 *     summary: Atualiza um documento
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do documento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Título atualizado do documento
 *               content:
 *                 type: string
 *                 description: Conteúdo atualizado do documento
 *     responses:
 *       200:
 *         description: Documento atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Document'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Sem permissão para editar este documento
 *       404:
 *         description: Documento não encontrado
 *       500:
 *         description: Erro do servidor
 */
router.put('/:id', documentController.updateDocument);

/**
 * @swagger
 * /api/documents/{id}:
 *   delete:
 *     summary: Exclui um documento
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do documento
 *     responses:
 *       200:
 *         description: Documento excluído com sucesso
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Sem permissão para excluir este documento
 *       404:
 *         description: Documento não encontrado
 *       500:
 *         description: Erro do servidor
 */
router.delete('/:id', documentController.deleteDocument);

/**
 * @swagger
 * /api/documents/{id}/images:
 *   post:
 *     summary: Faz upload de uma imagem para o documento
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do documento
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo de imagem
 *     responses:
 *       200:
 *         description: Imagem enviada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: URL da imagem enviada
 *       400:
 *         description: Formato de arquivo inválido ou erro no upload
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Sem permissão para editar este documento
 *       404:
 *         description: Documento não encontrado
 *       500:
 *         description: Erro do servidor
 */
router.post(
  '/:id/images', 
  upload.single('image'), 
  handleUploadErrors,
  documentController.uploadImage
);

module.exports = router;