import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { v4 as uuidv4 } from "uuid";

import { app } from "../../../../app";

let connection: Connection;

describe("Get Statement Operation controller", () => {
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

  it("should be able to get statement", async () => {
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
    const responseDeposit = await request(app)
      .post("/api/v1/statements/deposit")
      .set({ Authorization: `Bearer ${token}` })
      .send(deposit);
    const { id } = responseDeposit.body;

    const response = await request(app)
      .get(`/api/v1/statements/${id}`)
      .set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(200);
    expect(Number(response.body.amount)).toBe(Number(responseDeposit.body.amount));
  });

  it("should not be able to get a non-exist statement", async () => {
    const email = "johndoe@email.com";
    const password = "123pass";
    const responseSession = await request(app)
      .post("/api/v1/sessions")
      .send({ email, password });
    const { token } = responseSession.body;

    const response = await request(app)
      .get(`/api/v1/statements/${uuidv4}`)
      .set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(404);
  });
});