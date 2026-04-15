import { test, expect } from "@playwright/test";

export default function authTestCollection() {

  test("Valid user registration", async ({ request }) => {
    test.setTimeout(15000);

    // Create valid user data (unique email to avoid conflicts)
    const user = {
      name: "Test User",
      email: `testuser${Date.now()}@example.com`,
      password: "12345678",
    };

    // Send request to register user
    const response = await request.post("/api/user/register", {
      data: user,
    });

    // Expect successful creation
    expect(response.status()).toBe(201);
  });


  test("Invalid user registration", async ({ request }) => {
    test.setTimeout(10000);

    // Invalid data (wrong email format and short password)
    const user = {
      name: "Test User",
      email: "invalid-email",
      password: "1234",
    };

    // Send request with invalid data
    const response = await request.post("/api/user/register", {
      data: user,
    });

    // Expect validation error
    expect(response.status()).toBe(400);
  });


  test("Valid login", async ({ request }) => {

    // Create user for login test
    const user = {
      name: "Login User",
      email: `loginuser${Date.now()}@example.com`,
      password: "12345678",
    };

    // Register user first
    const registerResponse = await request.post("/api/user/register", {
      data: user,
    });

    expect(registerResponse.status()).toBe(201);

    // Login with correct credentials
    const response = await request.post("/api/user/login", {
      data: {
        email: user.email,
        password: user.password,
      },
    });

    const json = await response.json();

    // Expect successful login and token in response
    expect(response.status()).toBe(200);
    expect(json).toHaveProperty("data.token");
  });


  test("Get books without token", async ({ request }) => {

    // Try to access protected route without authentication
    const response = await request.get("/api/books");

    // Expect unauthorized error
    expect(response.status()).toBe(401);
  });
}