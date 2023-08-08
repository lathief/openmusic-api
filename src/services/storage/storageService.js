const fs = require('fs');
const { Pool } = require('pg');

class StorageService {
  constructor(folder) {
    this.folder = folder;
    this.pgPool = new Pool();

    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
  }

  writeFile(file, meta) {
    const filename = +new Date() + meta.filename;
    const path = `${this.folder}/${filename}`;

    const fileStream = fs.createWriteStream(path);

    return new Promise((resolve, reject) => {
      fileStream.on('error', (error) => reject(error));
      file.pipe(fileStream);
      file.on('end', () => resolve(filename));
    });
  }

  async updateAlbumCoverUrl(coverUrl, albumId) {
    const query = {
      text: 'UPDATE albums SET cover_url = $1 WHERE id = $2',
      values: [coverUrl, albumId],
    };

    await this.pgPool.query(query);
  }
}

module.exports = StorageService;
