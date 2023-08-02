const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const songs = require('./api/song');
const albums = require('./api/album');
const users = require('./api/users');
const playlists = require('./api/playlist');
const collaborations = require('./api/collaboration');
const authentication = require('./api/authentication');
const SongsService = require('./services/postgres/songsService');
const SongsValidator = require('./validator/songs');
const AlbumsService = require('./services/postgres/albumsService');
const UsersValidator = require('./validator/users');
const UsersService = require('./services/postgres/usersService');
const AuthenticationValidator = require('./validator/authentication');
const AuthenticationService = require('./services/postgres/authenticationService');
const AlbumValidator = require('./validator/albums');
const PlaylistsValidator = require('./validator/playlist');
const PlaylistsService = require('./services/postgres/playlistsService');
const CollaborationsValidator = require('./validator/collaborations');
const CollaborationsService = require('./services/postgres/collaborationsService');

const ClientError = require('./exception/client-error');

const TokenManager = require('./tokenize/tokenManager');

require('dotenv').config();

const init = async () => {
  const songsService = new SongsService();
  const albumsService = new AlbumsService();
  const usersService = new UsersService();
  const collaborationsService = new CollaborationsService();
  const playlistsService = new PlaylistsService(
    songsService,
    collaborationsService,
  );
  const authenticationsService = new AuthenticationService();
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
      plugin: Jwt,
    },
  ]);

  server.auth.strategy('musicapp_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });
  await server.register([
    {
      plugin: authentication,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationValidator,
      },
    },
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
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        usersService,
        validator: CollaborationsValidator,
      },
    },
  ]);
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;
    if (response instanceof Error) {
      console.log(response);
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }
      if (!response.isServer) {
        return h.continue;
      }
      const newResponse = h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami',
      });
      newResponse.code(500);
      return newResponse;
    }
    return h.continue;
  });
  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

init();
