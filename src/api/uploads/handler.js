const autoBind = require('auto-bind');

class UploadsHandler {
  constructor(service, validator) {
    this.uploadService = service;
    this.uploadValidator = validator;

    autoBind(this);
  }

  async postUploadAlbumCoverUrlHandler(request, h) {
    const { id: albumId } = request.params;
    const { cover } = request.payload;
    this.uploadValidator.validateAlbumCoverUrl(cover.hapi.headers);

    const filename = await this.uploadService.writeFile(cover, cover.hapi);
    const coverUrl = `http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/upload/${filename}`;
    await this.uploadService.updateAlbumCoverUrl(coverUrl, albumId);

    const response = h.response({
      status: 'success',
      message: 'Cover berhasil diupload',
    });

    response.code(201);
    return response;
  }
}

module.exports = UploadsHandler;
