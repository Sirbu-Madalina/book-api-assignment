import { apiFetch } from "./api";

export type Book = {
  _id?: string;
  title: string;
  author: string;
  image: string;
  description?: string;
  publishedYear: number;
  genre: string;
  price: number;
  stockQuantity: number;
  inStock: boolean;
};

export function getBooks() {
  return apiFetch("/books");
}

export function createBook(book: Book) {
  return apiFetch("/books", {
    method: "POST",
    body: JSON.stringify(book),
  });
}

export function updateBook(id: string, book: Partial<Book>) {
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