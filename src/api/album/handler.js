const ClientError = require('../../exception/client-error');

class AlbumsHandler {
  constructor(service, validator) {
    this.albumsService = service;
    this.albumsValidator = validator;
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
  }

  async getAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params;
      console.log(id);
      const song = await this.albumsService.getAlbumById(id);
      return {
        status: 'success',
        data: {
          song,
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }
      const response = h.response({
        status: 'error',
        Message: 'Maaf terjadi kesalahan pada server kami',
      });
      response.code(500);
      return response;
    }
  }

  async postAlbumHandler(request, h) {
    try {
      this.albumsValidator.validatorAlbumPayload(request.payload);
      const {
        name, year,
      } = request.payload;
      const albumId = await this.albumsService.addAlbum({
        name, year,
      });
      console.log(albumId);

      const response = h.response({
        status: 'success',
        message: 'album berhasil ditambahkan',
        data: {
          albumId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }
      const response = h.response({
        status: 'error',
        Message: error.message,
      });
      response.code(500);
      return response;
    }
  }

  async putAlbumByIdHandler(request, h) {
    try {
      this.albumsValidator.validatorAlbumPayload(request.payload);
      const { id } = request.params;
      await this.albumsService.editAlbumById(id, request.payload);
      return {
        status: 'success',
        message: 'lagu berhasil diperbarui',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }
      const response = h.response({
        status: 'error',
        Message: 'Maaf terjadi kesalahan pada server kami',
      });
      response.code(500);
      return response;
    }
  }

  async deleteAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params;
      await this.albumsService.deleteAlbumById(id);
      return {
        status: 'success',
        message: 'lagu berhasil dihapus',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }
      const response = h.response({
        status: 'error',
        Message: 'Maaf terjadi kesalahan pada server kami',
      });
      response.code(500);
      return response;
    }
  }
}

module.exports = AlbumsHandler;
