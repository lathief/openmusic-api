const InvariantError = require('../../exception/invariant-error');
const { AlbumCoverUrlSchema } = require('./schema');

const UploadsValidator = {
  validateAlbumCoverUrl: (headers) => {
    const validationResult = AlbumCoverUrlSchema.validate(headers);

    if (validationResult.error) { throw new InvariantError(validationResult.error.message); }
  },
};

module.exports = UploadsValidator;
