const { randomName } = require('./testHelpers.js');
const request = require('supertest');
const app = require('../src/service.js');

let testUser = { name: 'pizza diner', email: 'reg@test.com', password: 'a' };

beforeAll(async () => {
  testUser.email = randomName() + '@test.com';
  const registerRes = await request(app).post('/api/auth').send(testUser);
  testUser = registerRes.body.user;
  testUser.token = registerRes.body.token;
});

test("Get me", async () => {
    const res = await request(app)
        .get("/api/user/me")
        .set("Authorization", 'Bearer ' + testUser.token)
        .send();
    
    delete res.body.iat;
    res.body.token = testUser.token;
    
    expect(res.status).toBe(200);
    expect(res.body).toEqual(testUser)
});