import { test, expect } from "@playwright/test";

test("user can add a book", async ({ page }) => {
  const bookTitle = `Test Book ${Date.now()}`;

  await page.goto("http://localhost:5173/login");

  // login first
  await page.getByLabel("Email").fill("mada1234@gmail.com");
  await page.locator("#password").fill("12345678");
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page).toHaveURL("http://localhost:5173/");
  await page.goto("http://localhost:5173/library");

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
