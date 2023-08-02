const { Pool } = require('pg');
const { nanoid } = require('nanoid');
// eslint-disable-next-line import/no-extraneous-dependencies
const bcrypt = require('bcrypt');
const InvariantError = require('../../exception/invariant-error');
const AuthenticationError = require('../../exception/authentication-error');
const NotFoundError = require('../../exception/not-found-error');

class UsersService {
  constructor() {
    this.pgPool = new Pool();
  }

  async addUser({ username, password, fullname }) {
    await this.verifyNewUsername(username);
    const id = `user-${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, username, hashedPassword, fullname],
    };
    const result = await this.pgPool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('User gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async verifyNewUsername(username) {
    const query = {
      text: 'SELECT username FROM users WHERE username = $1',
      values: [username],
    };

    const result = await this.pgPool.query(query);

    if (result.rowCount > 0) {
      throw new InvariantError(
        'Gagal menambahkan user. Username sudah digunakan.',
      );
    }
  }

  async verifyUserCredential(username, password) {
    const query = {
      text: 'SELECT id, password FROM users WHERE username = $1',
      values: [username],
    };

    const result = await this.pgPool.query(query);

    if (!result.rowCount) {
      throw new AuthenticationError('Username yang Anda berikan salah');
    }

    const { id, password: hashedPassword } = result.rows[0];

    const match = await bcrypt.compare(password, hashedPassword);

    if (!match) {
      throw new AuthenticationError('Password yang Anda berikan salah');
    }

    return id;
  }

  async getUserById(userId) {
    const query = {
      text: 'SELECT id, username, fullname FROM users WHERE id = $1',
      values: [userId],
    };

    const result = await this.pgPool.query(query);

    if (result.rowCount === 0) throw new NotFoundError('User tidak ditemukan');

    return result.rows[0];
  }
}

module.exports = UsersService;
