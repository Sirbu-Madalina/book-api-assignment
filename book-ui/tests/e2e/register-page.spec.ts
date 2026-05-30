import { test, expect } from "@playwright/test";

test("user can switch from login to registration form", async ({ page }) => {
  await page.goto("/login");

  await page.getByRole("button", { name: "Create one" }).click();

  await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
  await expect(page.getByLabel("Name")).toBeVisible();
  await expect(page.getByRole("button", { name: "Create account" })).toBeVisible();
});
