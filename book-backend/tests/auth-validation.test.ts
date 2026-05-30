import { test, expect } from "@playwright/test";

export default function authValidationTestCollection() {
  test("Login rejects invalid email format", async ({ request }) => {
    const response = await request.post("/api/user/login", {
      data: {
        email: "not-an-email",
        password: "12345678",
      },
    });

    expect(response.status()).toBe(400);
  });

  test("Registration rejects short password", async ({ request }) => {
    const response = await request.post("/api/user/register", {
      data: {
        name: "Test User",
        email: "newuser@example.com",
        password: "123",
      },
    });

    expect(response.status()).toBe(400);
  });
}
