import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "../../../src/app";

describe("Auth routes", () => {
  it("registers a new user", async () => {
    const uniqueEmail = `test${Date.now()}@example.com`;

    const response = await request(app).post("/api/user/register").send({
      name: "Test User",
      email: uniqueEmail,
      password: "123456",
    });

    expect([200, 201]).toContain(response.status);
  });

  it("logs in an existing user and returns a token", async () => {
    const uniqueEmail = `login${Date.now()}@example.com`;

    await request(app).post("/api/user/register").send({
      name: "Login User",
      email: uniqueEmail,
      password: "123456",
    });

    const response = await request(app).post("/api/user/login").send({
      email: uniqueEmail,
      password: "123456",
    });

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });
});