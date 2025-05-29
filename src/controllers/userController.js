class ShareController {
  // POST /api/share/generate
  async generateShareCode(req, res) {
    // Gerar código único
    // Criar registro de compartilhamento
    // Retornar código
  }

  // POST /api/share/join
  async joinDocument(req, res) {
    // Validar código de compartilhamento
    // Adicionar usuário como colaborador
    // Retornar documento
  }

  // GET /api/share/:documentId/collaborators
  async getCollaborators(req, res) {
    // Listar colaboradores do documento
  }

  // DELETE /api/share/:documentId/collaborator/:userId
  async removeCollaborator(req, res) {
    // Remover colaborador (apenas owner)
  }

  // PUT /api/share/:documentId/permissions
  async updatePermissions(req, res) {
    // Atualizar permissões de colaborador
  }
}
