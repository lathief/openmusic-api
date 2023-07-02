const Hapi = require('@hapi/hapi');
const songs = require('./api/song');
const albums = require('./api/album');
const SongsService = require('./services/postgres/songsService');
const SongsValidator = require('./validator/songs');
const AlbumsService = require('./services/postgres/albumsService');
const AlbumValidator = require('./validator/albums');

require('dotenv').config();

const init = async () => {
  const songsService = new SongsService();
  const albumsService = new AlbumsService();
  const server = Hapi.server({
    port: process.env.SERVER_PORT || 8080,
    host: process.env.SERVER_HOST || 'localhost',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumValidator,
      },
    },
  ]);

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

init();
