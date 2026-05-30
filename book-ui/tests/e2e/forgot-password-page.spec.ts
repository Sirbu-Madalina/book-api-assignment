import { test, expect } from "@playwright/test";

test("forgot password page shows reset link form", async ({ page }) => {
  await page.goto("/forgot-password");

  await expect(page.getByRole("heading", { name: "Forgot password?" })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByRole("button", { name: "Send reset link" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to sign in" })).toBeVisible();
});
