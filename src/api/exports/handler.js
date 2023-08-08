const autoBind = require('auto-bind');

class ExportsHandler {
  constructor(service, playlistsService, validator) {
    this.exportsService = service;
    this.playlistService = playlistsService;
    this.exportsvalidator = validator;

    autoBind(this);
  }

  async postExportPlaylistSongsHandler(request, h) {
    this.exportsvalidator.validateExportPlaylistSongsPayload(request.payload);

    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.playlistService.verifyPlaylistOwner(id, credentialId);

    const message = {
      playlistId: id,
      targetEmail: request.payload.targetEmail,
    };

    await this.exportsService.sendMessage(
      'export:playlistSongs',
      JSON.stringify(message),
    );

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });

    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
