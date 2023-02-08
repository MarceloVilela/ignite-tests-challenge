import request from "supertest";
import { Connection, createConnection } from "typeorm";

import { app } from "../../../../app";

let connection: Connection;

describe("Authenticate User controller", () => {
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

  it("should be able to authenticate a user", async () => {
    const email = "johndoe@email.com";
    const password = "123pass";

    const response = await request(app)
      .post("/api/v1/sessions")
      .send({ email, password });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it("should not be able to authenticate whit wrong email/pass", async () => {
    const email = "johndoe@email.com";
    const password = "wrong";

    const response = await request(app)
      .post("/api/v1/sessions")
      .send({ email, password });

    expect(response.status).toBe(401);
  });

  it("should be able to authenticate a non-existing user", async () => {
    const email = "nonexists@email.com";
    const password = "123pass";

    const response = await request(app)
      .post("/api/v1/sessions")
      .send({ email, password });

      expect(response.status).toBe(401);
  });
});