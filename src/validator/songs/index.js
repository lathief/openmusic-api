const { SongPayloadSchema } = require('./schema');
const InvariantError = require('../../exception/invariant-error');

const SongValidator = {
  validatorSongPayload: (payload) => {
    const validationResult = SongPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = SongValidator;
