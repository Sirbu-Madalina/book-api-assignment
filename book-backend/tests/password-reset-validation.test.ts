import { test, expect } from "@playwright/test";

export default function passwordResetValidationTestCollection() {
  test("Forgot password rejects invalid email", async ({ request }) => {
    const response = await request.post("/api/user/forgot-password", {
      data: {
        email: "wrong-email",
      },
    });

    expect(response.status()).toBe(400);
  });

  test("Reset password rejects missing token", async ({ request }) => {
    const response = await request.post("/api/user/reset-password", {
      data: {
        password: "12345678",
      },
    });

    expect(response.status()).toBe(400);
  });
}
