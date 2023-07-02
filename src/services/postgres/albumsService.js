const { Pool } = require('pg');
// eslint-disable-next-line import/no-extraneous-dependencies
const { nanoid } = require('nanoid');
const InvariantError = require('../../exception/invariant-error');
const NotFoundError = require('../../exception/not-found-error');

class AlbumsService {
  constructor() {
    this.pgPool = new Pool();
  }

  async addAlbum({
    name,
    year,
  }) {
    const id = `album-${nanoid(16)}`;
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;

    const query = {
      text: 'INSERT INTO albums VALUES ($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, year, insertedAt, updatedAt],
    };
    const result = await this.pgPool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    console.log(id);
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const result = await this.pgPool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    return result.rows;
  }

  async editAlbumById(id, {
    name,
    year,
  }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2, updated_at = $6 WHERE id = $7 RETURNING id',
      values: [name, year, updatedAt, id],
    };

    const result = await this.pgPool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this.pgPool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal menghapus album. id tidak ditemukan');
    }
  }
}

module.exports = AlbumsService;
