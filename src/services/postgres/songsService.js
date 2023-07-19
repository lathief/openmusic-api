const { Pool } = require('pg');
// eslint-disable-next-line import/no-extraneous-dependencies
const { nanoid } = require('nanoid');
const InvariantError = require('../../exception/invariant-error');
const { mapGetAll, mapGetDetail } = require('../../utils');
const NotFoundError = require('../../exception/not-found-error');

class SongsService {
  constructor() {
    this.pgPool = new Pool();
  }

  async addSong({
    title,
    year,
    performer,
    genre,
    duration,
    albumId,
  }) {
    const id = `song-${nanoid(16)}`;
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;
    const query = {
      text: 'INSERT INTO songs VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
      values: [id, title, year, performer, genre, duration, albumId, insertedAt, updatedAt],
    };
    const result = await this.pgPool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getSongs(title, performer) {
    let query = 'SELECT id, title, performer FROM songs';
    const values = [];

    if (title && performer) {
      query += ' WHERE title ILIKE $1 AND performer ILIKE $2';
      values.push(`%${title}%`, `%${performer}%`);
    } else if (title) {
      query += ' WHERE title ILIKE $1';
      values.push(`%${title}%`);
    } else if (performer) {
      query += ' WHERE performer ILIKE $1';
      values.push(`%${performer}%`);
    }

    const result = await this.pgPool.query(query, values);
    return result.rows.map(mapGetAll);
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };

    const result = await this.pgPool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return result.rows.map(mapGetDetail)[0];
  }

  async editSongById(id, {
    title, year, performer, genre, duration, albumId,
  }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, albumid = $6, updated_at = $7 WHERE id = $8 RETURNING id',
      values: [title, year, performer, genre, duration, albumId, updatedAt, id],
    };

    const result = await this.pgPool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this.pgPool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal menghapus lagu. id tidak ditemukan');
    }
  }
}

module.exports = SongsService;
