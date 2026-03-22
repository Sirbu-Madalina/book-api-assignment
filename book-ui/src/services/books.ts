import { apiFetch } from "./api";

export type ReadingStatus = "want-to-read" | "currently-reading" | "finished";

export type Book = {
  _id?: string;
  title: string;
  author: string;
  coverImage: string;
  description?: string;
  genre?: string;
  totalPages: number;
  currentPage: number;
  status: ReadingStatus;
  startedAt?: string;
  finishedAt?: string;
  targetDate?: string;
  isFavorite: boolean;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateBookInput = {
  title: string;
  author: string;
  coverImage: string;
  description?: string;
  genre?: string;
  totalPages: number;
  currentPage?: number;
  status?: ReadingStatus;
  startedAt?: string;
  finishedAt?: string;
  targetDate?: string;
  isFavorite?: boolean;
};

export function getBooks() {
  return apiFetch("/books");
}

export function getBookById(id: string) {
  return apiFetch(`/books/${id}`);
}

export function createBook(book: CreateBookInput) {
  return apiFetch("/books", {
    method: "POST",
    body: JSON.stringify(book),
  });
}

export function updateBook(id: string, book: Partial<CreateBookInput>) {
  return apiFetch(`/books/${id}`, {
    method: "PUT",
    body: JSON.stringify(book),
  });
}

export function deleteBook(id: string) {
  return apiFetch(`/books/${id}`, {
    method: "DELETE",
  });
}