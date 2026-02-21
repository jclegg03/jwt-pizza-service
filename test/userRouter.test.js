const { randomName, createAdminUser } = require('./testHelpers.js');
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

test("update user (self)", async () => {
    const updatedUser = { name: randomName(), email: randomName() + "@jwt.com", password: "M0r3$ecure1" }

    const res = await request(app)
        .put("/api/user/" + testUser.id)
        .set("Authorization", 'Bearer ' + testUser.token)
        .send(updatedUser)

    testUser = structuredClone(updatedUser);
    testUser.token = res.body.token;
    testUser.id = res.body.user.id;

    delete res.body.user.id;
    delete updatedUser.password;
    delete res.body.user.roles;

    expect(res.status).toBe(200);
    expect(res.body.user).toEqual(updatedUser);
});

test("update user (duplicate email)", async () => {
    const updatedUser = { name: randomName(), email: "a@jwt.com", password: "M0r3$ecure1" }

    const res = await request(app)
        .put("/api/user/" + testUser.id)
        .set("Authorization", 'Bearer ' + testUser.token)
        .send(updatedUser)

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("Email already taken");
});

test('list users unauthorized', async () => {
    const listUsersRes = await request(app).get('/api/user');
    expect(listUsersRes.status).toBe(401);
});

test('list users', async () => {
    // const [user, userToken] = await registerUser(request(app));
    const user = await createAdminUser();
    const listUsersRes = await request(app)
        .get('/api/user')
        .set('Authorization', 'Bearer ' + user.token);

    expect(listUsersRes.status).toBe(200);
    expect(listUsersRes.body.length).toBe(10);

    expect(listUsersRes.body[0]).toHaveProperty('id');
    expect(listUsersRes.body[0]).toHaveProperty('name');
    expect(listUsersRes.body[0]).toHaveProperty('email');
    expect(listUsersRes.body[0]).toHaveProperty('roles');

    const listUsersRes2 = await request(app)
        .get('/api/user?page=2&limit=5')
        .set('Authorization', 'Bearer ' + user.token);

    expect(listUsersRes2.status).toBe(200);
    expect(listUsersRes2.body.length).toBe(5);
});

// async function registerUser(service) {
//     const testUser = {
//         name: 'pizza diner',
//         email: `${randomName()}@test.com`,
//         password: 'a',
//     };
//     const registerRes = await service.post('/api/auth').send(testUser);
//     registerRes.body.user.password = testUser.password;

//     return [registerRes.body.user, registerRes.body.token];
// }

test("delete user", async () => {
    const res = await request(app)
        .delete("/api/user/" + testUser.id)
        .set("Authorization", 'Bearer ' + testUser.token)
        .send();

    expect(res.status).toBe(200);

    const loginRes = await request(app)
        .put("/api/auth")
        .send(testUser);

    expect(loginRes.status).toBe(404);
});