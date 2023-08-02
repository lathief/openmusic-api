const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(service, validator) {
    this.playlistService = service;
    this.playlistValidator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this.playlistValidator.validatePlaylistPayload(request.payload);

    const { name } = request.payload;
    const { id: owner } = request.auth.credentials;

    const playlistId = await this.playlistService.addPlaylist({
      name,
      owner,
    });

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });

    response.code(201);
    return response;
  }

  async getPlaylistHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const data = await this.playlistService.getPlaylists(credentialId);

    return {
      status: 'success',
      data,
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.playlistService.verifyPlaylistOwner(id, credentialId);
    await this.playlistService.deletePlaylistById(id);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postSongToPlaylistHandler(request, h) {
    this.playlistValidator.validateSongPlaylistPayload(request.payload);
    const { songId } = request.payload;
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    const activity = 'add';

    await this.playlistService.verifyPlaylistAccess(id, credentialId);
    const song = await this.playlistService.addSongToPlaylist(id, songId);

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan',
      data: {
        song,
      },
    });

    await this.playlistService.addActivity(id, songId, credentialId, activity);

    response.code(201);
    return response;
  }

  async getSongsOnPlaylistHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.playlistService.verifyPlaylistAccess(id, credentialId);
    const result = await this.playlistService.getSongsOnPlaylist(id);
    const datas = result.rows;
    let playlist;

    const dataResponse = {
      id: datas[0].id,
      name: datas[0].name,
      username: datas[0].username,
      songs: [],
    };

    if (datas[0] === null) {
      playlist = {
        ...dataResponse,
      };
    } else {
      datas.map((data) => {
        if (data.song_id) {
          dataResponse.songs.push({
            id: data.song_id,
            title: data.title,
            performer: data.performer,
          });
        }
        return data;
      });

      playlist = {
        ...dataResponse,
      };
    }

    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deleteSongsOnPlaylistHandler(request) {
    this.playlistValidator.validateSongPlaylistPayload(request.payload);
    const { songId } = request.payload;
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    const activity = 'delete';

    await this.playlistService.verifyPlaylistAccess(id, credentialId);
    await this.playlistService.deleteSongFromPlaylist(id, songId);
    await this.playlistService.addActivity(id, songId, credentialId, activity);

    return {
      status: 'success',
      message: 'Lagu dalam Playlist berhasil dihapus',
    };
  }

  async getPlaylistActivitiesHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.playlistService.verifyPlaylistAccess(id, credentialId);
    const result = await this.playlistService.getActivities(id);
    const datas = result.rows;
    const playlistId = datas[0].playlist_id;
    const activities = datas.map((data) => ({
      username: data.username,
      title: data.title,
      action: data.action,
      time: data.time,
    }));

    return {
      status: 'success',
      data: {
        playlistId,
        activities,
      },
    };
  }
}

module.exports = PlaylistsHandler;
