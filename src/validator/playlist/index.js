const InvariantError = require('../../exception/invariant-error');
const { PlaylistPayloadSchema, SongPlaylistPayloadSchema } = require('./schema');

const PlaylistsValidator = {
  validatePlaylistPayload: (payload) => {
    const validationResult = PlaylistPayloadSchema.validate(payload);
    if (validationResult.error) { throw new InvariantError(validationResult.error.message); }
  },
  validateSongPlaylistPayload: (payload) => {
    const validationResult = SongPlaylistPayloadSchema.validate(payload);
    if (validationResult.error) { throw new InvariantError(validationResult.error.message); }
  },
};

module.exports = PlaylistsValidator;
