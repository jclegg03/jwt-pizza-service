const config = require('../src/config.js');
const { Role, DB } = require('../src/database/database.js');
const request = require('supertest');
const app = require('../src/service.js');

function randomName() {
  return Math.random().toString(36).substring(2, 12);
}

async function createAdminUser() {
  let user = { password: config.testUserPassword, roles: [{ role: Role.Admin }] };
  user.name = randomName();
  user.email = user.name + '@admin.com';

  user = await DB.addUser(user);

  const registerRes = await request(app).put('/api/auth').send(user);


  let userAuthToken = registerRes.body.token;
  user.token = userAuthToken;
  return user;
}

async function createBasicUser() {
  const user = {};
  user.name = "test diner";
  user.password = config.testUserPassword;
  user.email = randomName() + '@test.com';
  const registerRes = await request(app).post('/api/auth').send(user);

  user.token = registerRes.body.token;
  return user;
}

module.exports = {
    randomName,
    createAdminUser,
    createBasicUser
}