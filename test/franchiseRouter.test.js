const request = require('supertest');
const app = require('../src/service.js');
const { randomName } = require('./testHelpers.js');
const { Role, DB } = require('../src/database/database.js');

let testUser;

beforeAll(async () => {
  testUser = await createAdminUser()
  const registerRes = await request(app).put('/api/auth').send(testUser);


  testUserAuthToken = registerRes.body.token;
  testUser.token = testUserAuthToken;
});

test("Get user franchises", async () => {
    const getFranchisesRes = await request(app)
        .get('/api/franchise')
        .send();
    
    expect(getFranchisesRes.status).toBe(200);
    expect(getFranchisesRes.body).toHaveProperty("franchises");
});

test("Add franchise", async () => {
    const addFranchiseRes = await request(app)
        .post("/api/franchise")
        .set("Authorization", 'Bearer ' + testUser.token)
        .send({"name": randomName(), "admins": [{"email": testUser.email}]});

    expect(addFranchiseRes.status).toBe(200);
});

// afterAll(async () => {
//     demoteAdmin(testUser);
// });

async function createAdminUser() {
  let user = { password: 'toomanysecrets', roles: [{ role: Role.Admin }] };
  user.name = randomName();
  user.email = user.name + '@admin.com';

  user = await DB.addUser(user);
  return user;
}

// async function demoteAdmin(user) {
//   user.roles = [{ role: Role.Franchisee }];

//   user = await DB.updateUser(user);
// }