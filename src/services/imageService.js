const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configuração do Cloudinary a partir de variáveis de ambiente
// Esta configuração também pode estar no arquivo de configuração do cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Serviço para manipulação de imagens
 */
class ImageService {
  /**
   * Faz o upload de uma imagem para o Cloudinary
   * @param {String} imagePath - Caminho local para o arquivo de imagem
   * @param {Object} options - Opções adicionais para o upload (opcional)
   * @returns {String} URL da imagem no Cloudinary
   */
  async uploadImage(imagePath, options = {}) {
    try {
      // Configurar opções padrão
      const uploadOptions = {
        folder: 'live-document/images',
        resource_type: 'auto',
        ...options
      };
      
      // Fazer upload da imagem para o Cloudinary
      const result = await cloudinary.uploader.upload(imagePath, uploadOptions);
      
      // Remover o arquivo local depois do upload
      this.removeLocalFile(imagePath);
      
      // Retornar a URL da imagem
      return result.secure_url;
    } catch (error) {
      console.error('Erro ao fazer upload de imagem:', error);
      throw new Error('Erro ao fazer upload de imagem');
    }
  }
  
  /**
   * Remove um arquivo local
   * @param {String} filePath - Caminho do arquivo a ser removido
   */
  removeLocalFile(filePath) {
    try {
      fs.unlinkSync(filePath);
    } catch (error) {
      console.error('Erro ao remover arquivo local:', error);
    }
  }
  
  /**
   * Remove uma imagem do Cloudinary
   * @param {String} imageUrl - URL da imagem
   */
  async deleteImage(imageUrl) {
    try {
      // Extrair o public_id da URL
      const publicId = this.getPublicIdFromUrl(imageUrl);
      
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao excluir imagem:', error);
      return false;
    }
  }
  
  /**
   * Extrai o public_id de uma URL do Cloudinary
   * @param {String} url - URL da imagem
   * @returns {String} public_id da imagem
   */
  getPublicIdFromUrl(url) {
    try {
      // Exemplo de URL: https://res.cloudinary.com/cloud-name/image/upload/v1234567890/folder/file.jpg
      const urlParts = url.split('/');
      const filename = urlParts[urlParts.length - 1];
      const folderPath = urlParts[urlParts.length - 2];
      
      // O public_id geralmente é folder/filename sem a extensão
      const filenameWithoutExt = filename.split('.')[0];
      return `${folderPath}/${filenameWithoutExt}`;
    } catch (error) {
      console.error('Erro ao extrair public_id da URL:', error);
      return null;
    }
  }
}

module.exports = new ImageService();