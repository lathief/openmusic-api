const autoBind = require('auto-bind');

class UsersHandler {
  constructor(service, validator) {
    this.usersService = service;
    this.usersValidator = validator;

    autoBind(this);
  }

  async postUserHandler(request, h) {
    this.usersValidator.validateUserPayload(request.payload);
    const { username, password, fullname } = request.payload;

    const userId = await this.usersService.addUser({
      username,
      password,
      fullname,
    });

    const response = h.response({
      status: 'success',
      message: 'User berhasil ditambahkan',
      data: {
        userId,
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = UsersHandler;
