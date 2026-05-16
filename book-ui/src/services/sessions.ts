import { apiFetch } from "./api";
import type { Book } from "./books";

export type ReadingSession = {
  _id?: string;
  bookId: Book;
  minutesRead: number;
  pagesRead: number;
  note?: string;
  readAt: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateReadingSessionInput = {
  bookId: string;
  minutesRead: number;
  pagesRead: number;
  note?: string;
  readAt?: string;
};

export type CreateReadingSessionResponse = {
  session: ReadingSession;
  book: Book;
};

export type UpdateReadingSessionInput = Partial<CreateReadingSessionInput>;

export type UpdateReadingSessionResponse = {
  session: ReadingSession;
  books: Book[];
};

export type DeleteReadingSessionResponse = {
  message: string;
  books: Book[];
};

export function getReadingSessions() {
  return apiFetch("/sessions") as Promise<ReadingSession[]>;
}

export function createReadingSession(session: CreateReadingSessionInput) {
  return apiFetch("/sessions", {
    method: "POST",
    body: JSON.stringify(session),
  }) as Promise<CreateReadingSessionResponse>;
}

export function deleteReadingSession(id: string) {
  return apiFetch(`/sessions/${id}`, {
    method: "DELETE",
  }) as Promise<DeleteReadingSessionResponse>;
}

export function updateReadingSession(
  id: string,
  session: UpdateReadingSessionInput,
) {
  return apiFetch(`/sessions/${id}`, {
    method: "PUT",
    body: JSON.stringify(session),
  }) as Promise<UpdateReadingSessionResponse>;
}
