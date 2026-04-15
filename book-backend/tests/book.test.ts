import { test, expect } from "@playwright/test";

export default function bookTestCollection() {

  test("Create book with valid token", async ({ request }) => {
    test.setTimeout(15000);

    // Create a unique user (to avoid conflicts in DB)
    const user = {
      name: "Book User",
      email: `bookuser${Date.now()}@example.com`,
      password: "12345678",
    };

    // Step 1: Register user
    const registerResponse = await request.post("/api/user/register", {
      data: user,
    });
    expect(registerResponse.status()).toBe(201);

    // Step 2: Login user to get authentication token
    const loginResponse = await request.post("/api/user/login", {
      data: {
        email: user.email,
        password: user.password,
      },
    });
    expect(loginResponse.status()).toBe(200);

    const loginJson = await loginResponse.json();
    const token = loginJson.data.token;

    // Step 3: Define a valid book object
    const book = {
      title: "Atomic Habits",
      author: "James Clear",
      coverImage: "https://example.com/atomic-habits.jpg",
      description: "A book about building better habits.",
      genre: "Self-help",
      publishedYear: 2018,
      status: "want-to-read",
      totalPages: 320,
      currentPage: 0,
      isFavorite: false,
    };

    // Step 4: Send request with token to create book
    const response = await request.post("/api/books", {
      data: book,
      headers: {
        "auth-token": token,
      },
    });

    // Expect successful creation
    expect(response.status()).toBe(201);
  });


  test("Get books with valid token", async ({ request }) => {

    // Create user
    const user = {
      name: "Reader User",
      email: `reader${Date.now()}@example.com`,
      password: "12345678",
    };

    // Register user
    const registerResponse = await request.post("/api/user/register", {
      data: user,
    });
    expect(registerResponse.status()).toBe(201);

    // Login to get token
    const loginResponse = await request.post("/api/user/login", {
      data: {
        email: user.email,
        password: user.password,
      },
    });
    expect(loginResponse.status()).toBe(200);

    const loginJson = await loginResponse.json();
    const token = loginJson.data.token;

    // Request all books for authenticated user
    const response = await request.get("/api/books", {
      headers: {
        "auth-token": token,
      },
    });

    // Expect success response
    expect(response.status()).toBe(200);
  });


  test("Create book without token", async ({ request }) => {

    // Define a valid book object
    const book = {
      title: "Unauthorized Book",
      author: "Unknown Author",
      coverImage: "https://example.com/unauthorized-book.jpg",
      description: "This request should fail.",
      genre: "Fiction",
      publishedYear: 2024,
      status: "want-to-read",
      totalPages: 100,
      currentPage: 0,
      isFavorite: false,
    };

    // Try to create book WITHOUT token
    const response = await request.post("/api/books", {
      data: book,
    });

    // Expect unauthorized error
    expect(response.status()).toBe(401);
  });


  test("Create book without cover image", async ({ request }) => {

    // Create user
    const user = {
      name: "Cover User",
      email: `coveruser${Date.now()}@example.com`,
      password: "12345678",
    };

    // Register user
    const registerResponse = await request.post("/api/user/register", {
      data: user,
    });
    expect(registerResponse.status()).toBe(201);

    // Login to get token
    const loginResponse = await request.post("/api/user/login", {
      data: {
        email: user.email,
        password: user.password,
      },
    });
    expect(loginResponse.status()).toBe(200);

    const loginJson = await loginResponse.json();
    const token = loginJson.data.token;

    // Create invalid book (missing required coverImage)
    const invalidBook = {
      title: "No Cover Book",
      author: "Unknown Author",
      description: "This should fail because coverImage is missing.",
      genre: "Drama",
      publishedYear: 2023,
      status: "want-to-read",
      totalPages: 150,
      currentPage: 0,
      isFavorite: false,
    };

    // Send request with token but invalid data
    const response = await request.post("/api/books", {
      data: invalidBook,
      headers: {
        "auth-token": token,
      },
    });

    // Expect validation error
    expect(response.status()).toBe(400);
  });
}