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

test("Get Menu", async () => {
    const res = await request(app)
        .get("/api/order/menu")
        .send();
    
    expect(res.status).toBe(200);
});

test("Add item", async () => {
    const pizza = { title: randomName(), description: "No topping, no sauce, just carbs", image:"pizza9.png", price: 0.0001 };
    const put1Res = await request(app)
        .put("/api/order/menu")
        .set("Authorization", 'Bearer ' + testUser.token)
        .send(pizza);
    
    const getRes = await request(app)
        .get("/api/order/menu")
        .send();
    
    expect(put1Res.status).toBe(403);
    expect(getRes.body).not.toContain(pizza);

    let admin = await createAdminUser();

    const put2Res = await request(app)
        .put("/api/order/menu")
        .set("Authorization", 'Bearer ' + admin.token)
        .send(pizza);
    
    expect(put2Res.status).toBe(200);
    expect(put2Res.body).toEqual(
        expect.arrayContaining([
            expect.objectContaining(pizza)
        ]));
});