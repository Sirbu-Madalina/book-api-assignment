import { bookModel } from "../models/bookModel";
import { connect } from "../repository/database";

export type CreateBookInput = {
  title: string;
  author: string;
  coverImage: string;
  description?: string;
  genre?: string;
  totalPages: number;
  currentPage?: number;
  status?: "want-to-read" | "currently-reading" | "finished";
  startedAt?: Date;
  finishedAt?: Date;
  targetDate?: Date;
  isFavorite?: boolean;
};

export async function createBookService(data: CreateBookInput, userId: string) {
  await connect();

  const book = new bookModel({
    ...data,
    userId,
  });

  return await book.save();
}

export async function getAllBooksService(userId: string) {
  await connect();
  return await bookModel.find({ userId }).sort({ createdAt: -1 });
}

export async function getBookByIdService(id: string, userId: string) {
  await connect();
  return await bookModel.findOne({ _id: id, userId });
}

export async function updateBookByIdService(id: string, data: Partial<CreateBookInput>, userId: string) {
  await connect();

  return await bookModel.findOneAndUpdate(
    { _id: id, userId },
    data,
    {
      new: true,
      runValidators: true,
    }
  );
}

export async function deleteBookByIdService(id: string, userId: string) {
  await connect();
  return await bookModel.findOneAndDelete({ _id: id, userId });
}
