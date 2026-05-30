import { test, expect } from "@playwright/test";

export default function sessionAuthorizationTestCollection() {
  test("Get reading sessions without token is unauthorized", async ({ request }) => {
    const response = await request.get("/api/sessions");

    expect(response.status()).toBe(401);
  });

  test("Create reading session without token is unauthorized", async ({ request }) => {
    const response = await request.post("/api/sessions", {
      data: {
        bookId: "123",
        minutesRead: 20,
        pagesRead: 10,
      },
    });

    expect(response.status()).toBe(401);
  });
}
