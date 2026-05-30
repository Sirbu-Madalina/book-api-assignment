import { test, expect } from "@playwright/test";

export default function bookAuthorizationTestCollection() {
  test("Get book by id without token is unauthorized", async ({ request }) => {
    const response = await request.get("/api/books/123");

    expect(response.status()).toBe(401);
  });

  test("Update book with invalid token is unauthorized", async ({ request }) => {
    const response = await request.put("/api/books/123", {
      data: {
        title: "Updated Book",
      },
      headers: {
        "auth-token": "invalid-token",
      },
    });

    expect(response.status()).toBe(401);
  });
}
