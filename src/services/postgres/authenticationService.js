const { Pool } = require('pg');
const InvariantError = require('../../exception/invariant-error');

class AuthenticationsService {
  constructor() {
    this.pgPool = new Pool();
  }

  async addRefreshToken(token) {
    const query = {
      text: 'INSERT INTO authentications VALUES($1)',
      values: [token],
    };

    await this.pgPool.query(query);
  }

  async verifyRefreshToken(token) {
    const query = {
      text: 'SELECT token FROM authentications WHERE token = $1',
      values: [token],
    };

    const result = await this.pgPool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Refresh token tidak valid');
    }
  }

  async deleteRefreshToken(token) {
    await this.verifyRefreshToken(token);

    const query = {
      text: 'DELETE FROM authentications WHERE token = $1',
      values: [token],
    };

    await this.pgPool.query(query);
  }
}

module.exports = AuthenticationsService;
