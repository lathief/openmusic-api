const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exception/invariant-error');

class CollaborationsService {
  constructor() {
    this.pgPool = new Pool();
  }

  async addCollaboration(playlistId, userId) {
    const id = `collab-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    };

    const result = await this.pgPool.query(query);

    if (!result.rowCount) { throw new InvariantError('Kolaborasi gagal ditambahkan'); }

    return result.rows[0].id;
  }

  async deleteCollaboration(playlistId, userId) {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId],
    };

    const result = await this.pgPool.query(query);

    if (!result.rowCount) throw new InvariantError('Kolaborasi gagal dihapus');
  }

  async verifyCollaborator(playlistId, userId) {
    const query = {
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };

    const result = await this.pgPool.query(query);

    if (!result.rowCount) { throw new InvariantError('Kolaborasi gagal diverifikasi'); }
  }
}

module.exports = CollaborationsService;
