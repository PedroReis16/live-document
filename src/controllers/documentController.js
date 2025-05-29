class DocumentController {
  // GET /api/documents
  async getUserDocuments(req, res) {
    // Buscar documentos do usuário
    // Incluir documentos compartilhados
  }

  // POST /api/documents
  async createDocument(req, res) {
    // Criar novo documento
    // Salvar no banco
    // Retornar documento criado
  }

  // GET /api/documents/:id
  async getDocument(req, res) {
    // Verificar permissões
    // Retornar documento
  }

  // PUT /api/documents/:id
  async updateDocument(req, res) {
    // Verificar permissões de escrita
    // Atualizar documento
    // Emitir evento via socket
  }

  // DELETE /api/documents/:id
  async deleteDocument(req, res) {
    // Verificar se é owner
    // Deletar documento
    // Deletar compartilhamentos
  }

  // POST /api/documents/:id/images
  async uploadImage(req, res) {
    // Upload da imagem
    // Salvar URL no documento
    // Retornar URL
  }
}
