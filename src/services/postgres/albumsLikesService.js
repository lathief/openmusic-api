const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exception/invariant-error');
const NotFoundError = require('../../exception/not-found-error');
const ClientError = require('../../exception/client-error');

class AlbumLikesService {
  constructor(albumsService, cacheService) {
    this.pgPool = new Pool();
    this.albumsService = albumsService;
    this.cacheService = cacheService;
  }

  async addLikeToAlbum(albumId, userId) {
    const id = `like-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this.pgPool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal disukai');
    }

    await this.cacheService.delete(`likes:${albumId}`);
    return result.rows[0].id;
  }

  async getAlbumLikes(albumId) {
    try {
      const result = await this.cacheService.get(`likes:${albumId}`);
      return {
        likes: JSON.parse(result),
        cached: true,
      };
    } catch (error) {
      const query = {
        text: 'SELECT * FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this.pgPool.query(query);

      if (!result.rowCount) {
        throw new NotFoundError('Album tidak ditemukan');
      }

      await this.cacheService.set(
        `likes:${albumId}`,
        JSON.stringify(result.rowCount),
      );

      return {
        likes: result.rowCount,
        cached: false,
      };
    }
  }

  async deleteLike(albumId, userId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId],
    };

    const result = await this.pgPool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Like gagal dihapus. Id tidak ditemukan');
    }

    await this.cacheService.delete(`likes:${albumId}`);
  }

  async verifyUserLiked(albumId, userId) {
    await this.albumsService.getAlbumById(albumId);
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId],
    };

    const result = await this.pgPool.query(query);

    if (result.rowCount > 0) {
      throw new ClientError('Anda sudah pernah menyukai album ini');
    }
  }
}

module.exports = AlbumLikesService;
