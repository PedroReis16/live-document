const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const documentSchema = new Schema({
    id: String,
    title: String,
    content: Object, // JSON flexível para diferentes tipos de conteúdo
    type: String, // 'text', 'todo', 'list', etc.
    images: [String], // URLs das imagens
    ownerId: { type: Schema.Types.ObjectId, ref: 'User' },
    isShared: Boolean,
    collaborators: [{ type: Schema.Types.ObjectId, ref: 'User' }], // IDs dos usuários
    lastEditedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true // Isso criará automaticamente createdAt e updatedAt
});

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;