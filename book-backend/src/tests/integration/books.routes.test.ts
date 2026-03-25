import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "../../../src/app";

async function createAndLoginUser() {
  const email = `books${Date.now()}@test.com`;
  const password = "123456";

  await request(app).post("/api/user/register").send({
    name: "Books User",
    email,
    password,
  });

  const login = await request(app).post("/api/user/login").send({
    email,
    password,
  });

  const token = login.body.data?.token;

  expect(token).toBeDefined();

  return token;
}

async function createBook(token: string) {
  return await request(app)
    .post("/api/books")
    .set("auth-token", token)
    .send({
      title: "Atomic Habits",
      author: "James Clear",
      coverImage: "https://example.com/book.jpg",
      totalPages: 320,
      currentPage: 0,
      status: "want-to-read",
      targetDate: "2026-04-20",
    });
}

describe("Book routes", () => {
  it("creates a book", async () => {
    const token = await createAndLoginUser();
    const response = await createBook(token);

    expect(response.status).toBe(201);
  }, 15000);

  it("gets books for user", async () => {
    const token = await createAndLoginUser();

    const response = await request(app)
      .get("/api/books")
      .set("auth-token", token);

    expect(response.status).toBe(200);
  }, 15000);

  it("updates a book", async () => {
    const token = await createAndLoginUser();
    const createdBookResponse = await createBook(token);

    const bookId =
      createdBookResponse.body._id ||
      createdBookResponse.body.id ||
      createdBookResponse.body.data?._id ||
      createdBookResponse.body.data?.id;

    const response = await request(app)
      .put(`/api/books/${bookId}`)
      .set("auth-token", token)
      .send({
        status: "currently-reading",
        currentPage: 45,
        targetDate: "2026-05-01",
      });

    expect(response.status).toBe(200);
  }, 15000);

  it("deletes a book", async () => {
    const token = await createAndLoginUser();
    const createdBookResponse = await createBook(token);

    const bookId =
      createdBookResponse.body._id ||
      createdBookResponse.body.id ||
      createdBookResponse.body.data?._id ||
      createdBookResponse.body.data?.id;

    const response = await request(app)
      .delete(`/api/books/${bookId}`)
      .set("auth-token", token);

    expect(response.status).toBe(200);
  }, 15000);
});