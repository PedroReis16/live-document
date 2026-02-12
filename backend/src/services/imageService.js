const fs = require("fs");
const path = require("path");

/**
 * Serviço para manipulação de imagens
 */
class ImageService {
  /**
   * Converte uma imagem para Base64
   * @param {String} imagePath - Caminho local para o arquivo de imagem
   * @returns {String} String codificada em Base64 da imagem
   */
  async fileToBase64(imagePath) {
    try {
      // Ler o arquivo como buffer binário
      const fileBuffer = fs.readFileSync(imagePath);

      // Determinar o tipo MIME do arquivo baseado na extensão
      const mimeType = this.getMimeType(imagePath);

      // Converter para string Base64
      const base64String = fileBuffer.toString("base64");

      // Formato esperado para Data URLs: data:[<mime type>][;base64],<data>
      const dataUrl = `data:${mimeType};base64,${base64String}`;

      // Remover o arquivo local depois da conversão
      this.removeLocalFile(imagePath);

      return dataUrl;
    } catch (error) {
      console.error("Erro ao converter imagem para base64:", error);
      throw new Error("Erro ao processar imagem");
    }
  }

  /**
   * Upload de uma imagem
   * Esta função processa o arquivo e retorna a URL (neste caso, o base64)
   * @param {String} imagePath - Caminho local para o arquivo de imagem
   * @returns {String} URL da imagem (Base64 neste caso)
   */
  async uploadImage(imagePath) {
    try {
      // Como não estamos usando o Cloudinary, convertemos para base64
      const imageBase64 = await this.fileToBase64(imagePath);
      return imageBase64;
    } catch (error) {
      console.error("Erro ao fazer upload de imagem:", error);
      throw new Error("Erro ao fazer upload de imagem");
    }
  }

  /**
   * Determina o tipo MIME com base na extensão do arquivo
   * @param {String} filePath - Caminho do arquivo
   * @returns {String} Tipo MIME
   */
  getMimeType(filePath) {
    const extension = path.extname(filePath).toLowerCase();

    switch (extension) {
      case ".jpg":
      case ".jpeg":
        return "image/jpeg";
      case ".png":
        return "image/png";
      case ".gif":
        return "image/gif";
      case ".webp":
        return "image/webp";
      default:
        return "application/octet-stream";
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
      console.error("Erro ao remover arquivo local:", error);
    }
  }
}

module.exports = new ImageService();
