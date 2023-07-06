const autoBind = require('auto-bind');

class SongsHandler {
  constructor(service, validator) {
    this.songsService = service;
    this.songsValidator = validator;
    autoBind(this);
  }

  async getSongsHandler(request) {
    const {title} = request.query;
    const {performer} = request.query;
    const songs = await this.songsService.getSongs(title, performer);
    return {
      status: "success",
      data: {
        songs,
      },
    };
  }

  async getSongByIdHandler(request, h) {
    const { id } = request.params;
    const song = await this.songsService.getSongById(id);
    return {
      status: 'success',
      data: {
        song,
      },
    };
  }

  async postSongHandler(request, h) {

    this.songsValidator.validatorSongPayload(request.payload);
    const {
      title = 'untitled', year, performer, genre, duration, albumId,
    } = request.payload;
    const songId = await this.songsService.addSong({
      title, year, performer, genre, duration, albumId,
    });

    const response = h.response({
      status: 'success',
      message: 'lagu berhasil ditambahkan',
      data: {
        songId,
      },
    });
    response.code(201);
    return response;
  }

  async putSongByIdHandler(request, h) {

    this.songsValidator.validatorSongPayload(request.payload);
    const { id } = request.params;
    await this.songsService.editSongById(id, request.payload);
    return {
      status: 'success',
      message: 'lagu berhasil diperbarui',
    };
  }

  async deleteSongByIdHandler(request, h) {

    const { id } = request.params;
    await this.songsService.deleteSongById(id);
    return {
      status: 'success',
      message: 'lagu berhasil dihapus',
    };
  }
}

module.exports = SongsHandler;
