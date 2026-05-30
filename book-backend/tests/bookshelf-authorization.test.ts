import { test, expect } from "@playwright/test";

export default function bookshelfAuthorizationTestCollection() {
  test("Get bookshelves without token is unauthorized", async ({ request }) => {
    const response = await request.get("/api/bookshelves");

    expect(response.status()).toBe(401);
  });

  test("Create bookshelf without token is unauthorized", async ({ request }) => {
    const response = await request.post("/api/bookshelves", {
      data: {
        name: "Favorites",
        description: "Favorite books",
        bookIds: [],
      },
    });

    expect(response.status()).toBe(401);
  });
}
