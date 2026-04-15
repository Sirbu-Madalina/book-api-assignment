import { test, expect } from "@playwright/test";

export default function health() {

  // Test to verify that the API is running correctly
  test("Health check", async ({ request }) => {

    // Send GET request to the root API endpoint
    const response = await request.get("/api/");

    // Read response as plain text
    const text = await response.text();

    // Check that the response status is 200 (success)
    expect(response.status()).toBe(200);

    // Check that the response message is correct
    expect(text).toBe("Welcome to the Book Tracking API");
  });
}