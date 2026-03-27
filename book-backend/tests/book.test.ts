import { test, expect } from "@playwright/test";

export default function bookTestCollection() {
  test("Create book with valid token", async ({ request }) => {
    const user = {
      name: "Book User",
      email: `bookuser${Date.now()}@example.com`,
      password: "12345678",
    };

    // register
    const registerResponse = await request.post("/api/user/register", {
      data: user,
    });
    expect(registerResponse.status()).toBe(201);

    // login
    const loginResponse = await request.post("/api/user/login", {
      data: {
        email: user.email,
        password: user.password,
      },
    });
    expect(loginResponse.status()).toBe(200);

    const loginJson = await loginResponse.json();
    const token = loginJson.data.token;

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

    const response = await request.post("/api/books", {
      data: book,
      headers: {
        "auth-token": token,
      },
    });

    expect(response.status()).toBe(201);
  });

  test("Get books with valid token", async ({ request }) => {
    const user = {
      name: "Reader User",
      email: `reader${Date.now()}@example.com`,
      password: "12345678",
    };

    // register
    const registerResponse = await request.post("/api/user/register", {
      data: user,
    });
    expect(registerResponse.status()).toBe(201);

    // login
    const loginResponse = await request.post("/api/user/login", {
      data: {
        email: user.email,
        password: user.password,
      },
    });
    expect(loginResponse.status()).toBe(200);

    const loginJson = await loginResponse.json();
    const token = loginJson.data.token;

    const response = await request.get("/api/books", {
      headers: {
        "auth-token": token,
      },
    });

    expect(response.status()).toBe(200);
  });

  test("Create book without token", async ({ request }) => {
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

    const response = await request.post("/api/books", {
      data: book,
    });

    expect(response.status()).toBe(401);
  });

  test("Create book without cover image", async ({ request }) => {
    const user = {
      name: "Cover User",
      email: `coveruser${Date.now()}@example.com`,
      password: "12345678",
    };

    // register
    const registerResponse = await request.post("/api/user/register", {
      data: user,
    });
    expect(registerResponse.status()).toBe(201);

    // login
    const loginResponse = await request.post("/api/user/login", {
      data: {
        email: user.email,
        password: user.password,
      },
    });
    expect(loginResponse.status()).toBe(200);

    const loginJson = await loginResponse.json();
    const token = loginJson.data.token;

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

    const response = await request.post("/api/books", {
      data: invalidBook,
      headers: {
        "auth-token": token,
      },
    });

    expect(response.status()).toBe(400);
  });
}