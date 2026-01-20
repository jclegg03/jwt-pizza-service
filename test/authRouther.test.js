const request = require('supertest');
const app = require('../src/service.js');
const { randomName, createBasicUser } = require('./testHelpers.js');

let testUser;

beforeAll(async () => {
  testUser = await createBasicUser();
  expectValidJwt(testUser.token);
});

test('login', async () => {
  const loginRes = await request(app).put('/api/auth').send(testUser);
  expect(loginRes.status).toBe(200);
  expectValidJwt(loginRes.body.token);

  const expectedUser = { ...testUser, roles: [{ role: 'diner' }] };
  delete expectedUser.password;
  delete expectedUser.token;
  expect(loginRes.body.user).toMatchObject(expectedUser);
});

test('logout', async () => {
  const logoutRes = await request(app)
    .delete('/api/auth')
    .set("Authorization", 'Bearer ' + testUser.token)
    .send();

  expect(logoutRes.status).toBe(200);
});

function expectValidJwt(potentialJwt) {
  expect(potentialJwt).toMatch(/^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/);
}