import { test, expect } from "@playwright/test";

test("user can add a book", async ({ page }) => {
  const bookTitle = `Test Book ${Date.now()}`;
  const books: any[] = [];

  await page.route("**/api/user/login", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        error: null,
        data: {
          userId: "demo-user-id",
          token: "demo-token",
          yearlyReadingGoal: 12,
        },
      }),
    });
  });

  await page.route("**/api/books", async (route) => {
    const request = route.request();

    if (request.method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(books),
      });
      return;
    }

    if (request.method() === "POST") {
      const data = request.postDataJSON();
      const createdBook = {
        _id: `book-${Date.now()}`,
        ...data,
        userId: "demo-user-id",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      books.unshift(createdBook);

      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify(createdBook),
      });
      return;
    }

    await route.fallback();
  });

  await page.goto("/login");

  // login first
  await page.getByLabel("Email").fill("mada1234@gmail.com");
  await page.locator("#password").fill("12345678");
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page).toHaveURL(/\/$/);
  await page.goto("/library");

  // open add book modal
  await page.getByRole("button", { name: "Add Book" }).click();
  const addBookDialog = page.getByRole("dialog", { name: "Add new book" });

  // fill form
  await addBookDialog.getByLabel("Title").fill(bookTitle);
  await addBookDialog.getByLabel("Author").fill("Test Author");

  // submit
  await addBookDialog.getByRole("button", { name: "Create" }).click();

  // verify appears
  await expect(page.getByRole("heading", { name: bookTitle })).toBeVisible();
});
