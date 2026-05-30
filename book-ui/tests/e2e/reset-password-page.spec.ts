import { test, expect } from "@playwright/test";

test("reset password page validates missing token", async ({ page }) => {
  await page.goto("/reset-password");

  await page.locator("#password").fill("12345678");
  await page.getByRole("button", { name: "Reset password" }).click();

  await expect(page.getByText("Password reset link is missing a token.")).toBeVisible();
});
