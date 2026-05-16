import { bookModel } from "../models/bookModel";
import { readingSessionModel } from "../models/readingSessionModel";
import { connect } from "../repository/database";

export type CreateReadingSessionInput = {
  bookId: string;
  minutesRead: number;
  pagesRead: number;
  note?: string;
  readAt?: Date;
};

export type UpdateReadingSessionInput = Partial<CreateReadingSessionInput>;

export async function createReadingSessionService(
  data: CreateReadingSessionInput,
  userId: string
) {
  await connect();

  const book = await bookModel.findOne({ _id: data.bookId, userId });

  if (!book) {
    return null;
  }

  const nextPage = Math.min(
    book.totalPages,
    (book.currentPage ?? 0) + data.pagesRead
  );
  const isFinished = nextPage >= book.totalPages;

  book.currentPage = nextPage;
  book.status = isFinished ? "finished" : "currently-reading";

  if (!book.startedAt) {
    book.startedAt = new Date();
  }

  if (isFinished && !book.finishedAt) {
    book.finishedAt = new Date();
  }

  const session = new readingSessionModel({
    userId,
    bookId: data.bookId,
    minutesRead: data.minutesRead,
    pagesRead: data.pagesRead,
    note: data.note ?? "",
    readAt: data.readAt ?? new Date(),
  });

  const [savedSession, savedBook] = await Promise.all([
    session.save(),
    book.save(),
  ]);

  const populatedSession = await savedSession.populate(
    "bookId",
    "title author coverImage totalPages currentPage status"
  );

  return {
    session: populatedSession,
    book: savedBook,
  };
}

export async function getReadingSessionsService(userId: string) {
  await connect();

  return await readingSessionModel
    .find({ userId })
    .populate("bookId", "title author coverImage totalPages currentPage status")
    .sort({ readAt: -1, createdAt: -1 });
}

export async function deleteReadingSessionService(id: string, userId: string) {
  await connect();

  const session = await readingSessionModel.findOneAndDelete({ _id: id, userId });

  if (!session) {
    return null;
  }

  const book = await bookModel.findOne({ _id: session.bookId, userId });

  if (book) {
    applyPageDelta(book, -session.pagesRead);
    await book.save();
  }

  return {
    session,
    books: book ? [book] : [],
  };
}

export async function updateReadingSessionService(
  id: string,
  data: UpdateReadingSessionInput,
  userId: string
) {
  await connect();

  const session = await readingSessionModel.findOne({ _id: id, userId });

  if (!session) {
    return null;
  }

  const oldBookId = session.bookId.toString();
  const nextBookId = data.bookId ?? oldBookId;
  const changedBook = nextBookId !== oldBookId;
  const oldPages = session.pagesRead;
  const nextPages = data.pagesRead ?? session.pagesRead;

  const oldBook = await bookModel.findOne({ _id: oldBookId, userId });
  const nextBook = changedBook
    ? await bookModel.findOne({ _id: nextBookId, userId })
    : oldBook;

  if (!nextBook) {
    return null;
  }

  if (oldBook && changedBook) {
    applyPageDelta(oldBook, -oldPages);
    await oldBook.save();
  }

  if (nextBook) {
    const pageDelta = changedBook ? nextPages : nextPages - oldPages;
    applyPageDelta(nextBook, pageDelta);
    await nextBook.save();
  }

  session.bookId = nextBook._id;
  session.minutesRead = data.minutesRead ?? session.minutesRead;
  session.pagesRead = nextPages;
  session.note = data.note ?? session.note;
  session.readAt = data.readAt ?? session.readAt;

  const savedSession = await session.save();
  const populatedSession = await savedSession.populate(
    "bookId",
    "title author coverImage totalPages currentPage status"
  );

  return {
    session: populatedSession,
    books: changedBook && oldBook ? [oldBook, nextBook] : [nextBook],
  };
}

function applyPageDelta(book: any, delta: number) {
  book.currentPage = Math.min(
    book.totalPages,
    Math.max(0, (book.currentPage ?? 0) + delta)
  );

  if (book.currentPage === 0) {
    book.status = "want-to-read";
    book.startedAt = undefined;
    book.finishedAt = undefined;
    return;
  }

  if (book.currentPage >= book.totalPages) {
    book.status = "finished";
    book.finishedAt = book.finishedAt ?? new Date();
    book.startedAt = book.startedAt ?? new Date();
    return;
  }

  book.status = "currently-reading";
  book.startedAt = book.startedAt ?? new Date();
  book.finishedAt = undefined;
}
