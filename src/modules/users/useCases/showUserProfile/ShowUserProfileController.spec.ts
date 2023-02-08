import request from "supertest";
import { Connection, createConnection } from "typeorm";

import { app } from "../../../../app";

let connection: Connection;

describe("Show Profile controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to show a user profile", async () => {
    const name = "John Doe";
    const email = "johndoe@email.com";
    const password = "123pass";

    await request(app)
      .post("/api/v1/users")
      .send({ name, email, password });

    const responseSession = await request(app)
      .post("/api/v1/sessions")
      .send({ email, password });

    const { token } = responseSession.body;

    const response = await request(app)
      .get("/api/v1/profile")
      .set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(200);
    expect(response.body.email).toEqual(email);
  });
});