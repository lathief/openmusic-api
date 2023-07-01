const Hapi = require('@hapi/hapi');
const songs = require('./api/song');
const SongsService = require('./services/postgres/songsService');
const SongValidator = require('./validator/songs');
require('dotenv').config();

const init = async () => {
  const songsService = new SongsService();
  const server = Hapi.server({
    port: process.env.SERVER_PORT || 8080,
    host: process.env.SERVER_HOST || 'localhost',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register({
    plugin: songs,
    options: {
      service: songsService,
      validator: SongValidator,
    },
  });

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

init();
