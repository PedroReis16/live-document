const mongoose = require('mongoose');

const { Schema } = mongoose;

const sharedDocumentSchema = new Schema({
    id: String,
    documentId: {
        type: Schema.Types.ObjectId,
        ref: 'Document'
    },
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    sharedWithId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    permissions: {
        type: String,
        enum: ['read', 'write', 'admin']
    },
    shareCode: String,
    expiresAt: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const SharedDocument = mongoose.model('SharedDocument', sharedDocumentSchema);

module.exports = SharedDocument;