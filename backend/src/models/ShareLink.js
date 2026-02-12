const mongoose = require('mongoose');

const shareLinkSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  shareToken: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  permission: {
    type: String,
    enum: ['read', 'write', 'admin'],
    default: 'read'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  // Quantas vezes este link foi acessado
  accessCount: {
    type: Number,
    default: 0
  },
  // Usuários que já acessaram este link
  accessedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

// Índice para busca rápida por token
shareLinkSchema.index({ shareToken: 1 });

// Índice para expiração automática (TTL index)
shareLinkSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('ShareLink', shareLinkSchema);