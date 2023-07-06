const autoBind = require('auto-bind');
class AlbumsHandler {
  constructor(service, validator) {
    this.albumsService = service;
    this.albumsValidator = validator;
    autoBind(this);
  }

  async getAlbumByIdHandler(request, h) {
    const { id } = request.params;
    const album = await this.albumsService.getAlbumById(id);
    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async postAlbumHandler(request, h) {
    this.albumsValidator.validatorAlbumPayload(request.payload);
    const {
      name, year,
    } = request.payload;
    const albumId = await this.albumsService.addAlbum({
      name, year,
    });

    const response = h.response({
      status: 'success',
      message: 'album berhasil ditambahkan',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async putAlbumByIdHandler(request, h) {
    this.albumsValidator.validatorAlbumPayload(request.payload);
    const { id } = request.params;
    await this.albumsService.editAlbumById(id, request.payload);
    return {
      status: 'success',
      message: 'album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request, h) {
    const { id } = request.params;
    await this.albumsService.deleteAlbumById(id);
    return {
      status: 'success',
      message: 'album berhasil dihapus',
    };
  }
}

module.exports = AlbumsHandler;
