import { apiFetch } from "./api";
import type { Book } from "./books";

export type Bookshelf = {
  _id?: string;
  name: string;
  description?: string;
  bookIds: Book[];
  createdAt?: string;
  updatedAt?: string;
};

export type BookshelfInput = {
  name: string;
  description?: string;
  bookIds: string[];
};

export function getBookshelves() {
  return apiFetch("/bookshelves") as Promise<Bookshelf[]>;
}

export function createBookshelf(shelf: BookshelfInput) {
  return apiFetch("/bookshelves", {
    method: "POST",
    body: JSON.stringify(shelf),
  }) as Promise<Bookshelf>;
}

export function updateBookshelf(id: string, shelf: Partial<BookshelfInput>) {
  return apiFetch(`/bookshelves/${id}`, {
    method: "PUT",
    body: JSON.stringify(shelf),
  }) as Promise<Bookshelf>;
}

export function deleteBookshelf(id: string) {
  return apiFetch(`/bookshelves/${id}`, {
    method: "DELETE",
  });
}
