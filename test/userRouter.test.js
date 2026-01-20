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

// test("update user (self)", async () => {
//     const updatedUser = { name: randomName(), email: randomName() + "@jwt.com", password: "M0r3$ecure1"}

//     const res = await request(app)
//         .put("/api/user/" + testUser.id)
//         .set("Authorization", 'Bearer ' + testUser.token)
//         .send(updatedUser)
    
//     testUser = structuredClone(updatedUser);
//     testUser.token = res.body.token;
//     testUser.id = res.body.user.id;
    
//     delete res.body.user.id;
//     delete updatedUser.password;
//     delete res.body.user.roles;
    
//     expect(res.status).toBe(200);
//     expect(res.body.user).toEqual(updatedUser);
// });

//TODO update this test after delete user functionality is finished.
test("delete user", async () => {
    const res = await request(app)
        .delete("/api/user/" + testUser.id)
        .set("Authorization", 'Bearer ' + testUser.token)
        .send();
    
    expect(res.status).toBe(200);
});