import { test, expect } from "@playwright/test";

test("user can add a book", async ({ page }) => {
  await page.goto("http://localhost:5173/login");

  // login first
  await page.getByLabel("Email").fill("mada1234@gmail.com");
  await page.getByLabel("Password").fill("12345678");
  await page.getByRole("button", { name: "Sign In" }).click();

  await page.waitForTimeout(1500);

  // open add book modal
  await page.getByRole("button", { name: /add/i }).click();

  // fill form
  await page.getByLabel("Title").fill("Test Book");
  await page.getByLabel("Author").fill("Test Author");

  // submit
  await page.getByRole("button", { name: /add/i }).last().click();

  // verify appears
  await expect(page.getByText("Test Book")).toBeVisible();
});