import request from "supertest";
import { Connection, createConnection } from "typeorm";

import { app } from "../../../../app";

let connection: Connection;

describe("Create statement controller", () => {
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

  it("should not be able to create a withdraw when Insufficientfunds", async () => {
    const email = "johndoe@email.com";
    const password = "123pass";
    const responseSession = await request(app)
      .post("/api/v1/sessions")
      .send({ email, password });
    const { token } = responseSession.body;

    const deposit = {
      amount: 9,
      description: 'sample deposit',
    };
    await request(app)
      .post("/api/v1/statements/deposit")
      .set({ Authorization: `Bearer ${token}` })
      .send(deposit);

    const withdraw = {
      amount: 999,
      description: 'sample withdraw',
    };
    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .set({ Authorization: `Bearer ${token}` })
      .send(withdraw);
      
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual("Insufficient funds");
  });

  it("should be able to create a deposit", async () => {
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
    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .set({ Authorization: `Bearer ${token}` })
      .send(deposit);

    expect(response.status).toBe(201);
    expect(response.body.amount).toEqual(deposit.amount);
    expect(response.body.type).toEqual("deposit");
  });

  it("should be able to create a withdraw", async () => {
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

    const withdraw = {
      amount: 99,
      description: 'sample withdraw',
    };
    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .set({ Authorization: `Bearer ${token}` })
      .send(withdraw);

    expect(response.status).toBe(201);
    expect(response.body.amount).toEqual(deposit.amount);
    expect(response.body.type).toEqual("withdraw");
  });
});