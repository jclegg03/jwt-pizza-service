const request = require('supertest');
const app = require('../src/service.js');
const { randomName } = require('./testHelpers.js');
const { Role, DB } = require('../src/database/database.js');
const config = require('../src/config.js');

let testUser;

beforeAll(async () => {
  testUser = await createAdminUser()
  const registerRes = await request(app).put('/api/auth').send(testUser);


  testUserAuthToken = registerRes.body.token;
  testUser.token = testUserAuthToken;
});

test("Get franchises", async () => {
    const getFranchisesRes = await request(app)
        .get('/api/franchise')
        .send();
    
    expect(getFranchisesRes.status).toBe(200);
    expect(getFranchisesRes.body).toHaveProperty("franchises");
});

test("Add franchise", async () => {
    const franchiseName = randomName();
    const franchise = {"name": franchiseName, "admins": [{"email": testUser.email}]};
    const addFranchiseRes = await request(app)
        .post("/api/franchise")
        .set("Authorization", 'Bearer ' + testUser.token)
        .send(franchise);

    franchise.admins[0].name = testUser.name;
    delete addFranchiseRes.body.admins[0].id;
    delete addFranchiseRes.body.id;
    expect(addFranchiseRes.status).toBe(200);
    expect(addFranchiseRes.body).toEqual(franchise);
});

test("Add store", async () => {
    const franchiseName = randomName();
    let franchise = {"name": franchiseName, "admins": [{"email": testUser.email}]};
    franchise = await DB.createFranchise(franchise);
    const store = {"franchiseId": franchise.id, "name":randomName()};

    const addStoreRes = await request(app)
        .post("/api/franchise/" + franchise.id + "/store")
        .set("Authorization", 'Bearer ' + testUser.token)
        .send(store);
    
    delete addStoreRes.body.id;
    
    expect(addStoreRes.status).toBe(200);
    expect(addStoreRes.body).toEqual(store);
});

test("Get user franchises", async () => {
    const franchiseName = randomName();
    let franchise = {"name": franchiseName, "admins": [{"email": testUser.email}]};
    franchise = await DB.createFranchise(franchise);
    franchise.stores = [];

    const getFranchisesRes = await request(app)
        .get("/api/franchise/" + testUser.id)
        .set("Authorization", 'Bearer ' + testUser.token)
        .send();
    
    expect(getFranchisesRes.status).toBe(200);
    expect(getFranchisesRes.body).toEqual([franchise]);
});

// afterAll(async () => {
//     await demoteAdmin(testUser);
// });

async function createAdminUser() {
  let user = { password: config.adminPassword, roles: [{ role: Role.Admin }] };
  user.name = randomName();
  user.email = user.name + '@admin.com';

  user = await DB.addUser(user);
  return user;
}

// async function demoteAdmin(user) {
//   user.roles = [{ role: Role.Diner }];

//   const res = await request(app)
//     .put("/api/user/" + user.id)
//     .set("Authorization", 'Bearer ' + user.token)
//     .send(user);

//   expect(res.status).toBe(200);
// }