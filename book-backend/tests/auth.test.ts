import { test, expect } from "@playwright/test";

export default function authTestCollection() {
  test("Valid user registration", async ({ request }) => {
    test.setTimeout(15000);

    const user = {
      name: "Test User",
      email: `testuser${Date.now()}@example.com`,
      password: "12345678",
    };

    const response = await request.post("/api/user/register", {
      data: user,
    });

    expect(response.status()).toBe(201);
  });

  test("Invalid user registration", async ({ request }) => {
    test.setTimeout(10000);

    const user = {
      name: "Test User",
      email: "invalid-email",
      password: "1234",
    };

    const response = await request.post("/api/user/register", {
      data: user,
    });

    expect(response.status()).toBe(400);
  });

  test("Valid login", async ({ request }) => {
    const user = {
      name: "Login User",
      email: `loginuser${Date.now()}@example.com`,
      password: "12345678",
    };

    const registerResponse = await request.post("/api/user/register", {
      data: user,
    });

    expect(registerResponse.status()).toBe(201);

    const response = await request.post("/api/user/login", {
      data: {
        email: user.email,
        password: user.password,
      },
    });

    const json = await response.json();

    expect(response.status()).toBe(200);
    expect(json).toHaveProperty("data.token");
  });

  test("Get books without token", async ({ request }) => {
    const response = await request.get("/api/books");

    expect(response.status()).toBe(401);
  });
}