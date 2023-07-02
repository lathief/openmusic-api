const { AlbumPayloadSchema } = require('./schema');
const InvariantError = require('../../exception/invariant-error');

const AlbumValidator = {
  validatorAlbumPayload: (payload) => {
    const validationResult = AlbumPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = AlbumValidator;
