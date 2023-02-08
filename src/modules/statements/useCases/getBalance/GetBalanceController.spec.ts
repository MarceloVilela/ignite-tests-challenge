import request from "supertest";
import { Connection, createConnection } from "typeorm";

import { app } from "../../../../app";

let connection: Connection;

describe("Get Balance controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const name = "John Doe";
    const email = "johndoe@email.com";
    const password = "123pass";
    await request(app)
      .post("/api/v1/users")
      .send({ name, email, password });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get balance", async () => {
    const email = "johndoe@email.com";
    const password = "123pass";
    const responseSession = await request(app)
      .post("/api/v1/sessions")
      .send({ email, password });
    const { token } = responseSession.body;

    const deposit = {
      amount: 99,
      description: 'sample deposit',
    };
    await request(app)
      .post("/api/v1/statements/deposit")
      .set({ Authorization: `Bearer ${token}` })
      .send(deposit);

    const response = await request(app)
      .get(`/api/v1/statements/balance`)
      .set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(200);
    expect(response.body.statement.length).toBe(1);
    expect(response.body.statement[0].amount).toBe(deposit.amount);
  });
});