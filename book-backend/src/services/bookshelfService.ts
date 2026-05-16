import { bookModel } from "../models/bookModel";
import { bookshelfModel } from "../models/bookshelfModel";
import { connect } from "../repository/database";

export type BookshelfInput = {
  name: string;
  description?: string;
  bookIds?: string[];
};

async function getOwnedBookIds(bookIds: string[] = [], userId: string) {
  if (bookIds.length === 0) {
    return [];
  }

  const books = await bookModel.find({ _id: { $in: bookIds }, userId }).select("_id");
  return books.map((book) => book._id);
}

export async function createBookshelfService(data: BookshelfInput, userId: string) {
  await connect();

  const ownedBookIds = await getOwnedBookIds(data.bookIds, userId);
  const shelf = new bookshelfModel({
    name: data.name,
    description: data.description ?? "",
    bookIds: ownedBookIds,
    userId,
  });

  const savedShelf = await shelf.save();
  return await savedShelf.populate("bookIds", "title author coverImage totalPages currentPage status");
}

export async function getBookshelvesService(userId: string) {
  await connect();

  return await bookshelfModel
    .find({ userId })
    .populate("bookIds", "title author coverImage totalPages currentPage status")
    .sort({ createdAt: -1 });
}

export async function updateBookshelfService(
  id: string,
  data: Partial<BookshelfInput>,
  userId: string
) {
  await connect();

  const updateData: Partial<BookshelfInput> = {};

  if (data.name !== undefined) {
    updateData.name = data.name;
  }

  if (data.description !== undefined) {
    updateData.description = data.description;
  }

  if (data.bookIds !== undefined) {
    updateData.bookIds = await getOwnedBookIds(data.bookIds, userId) as any;
  }

  return await bookshelfModel
    .findOneAndUpdate({ _id: id, userId }, updateData, {
      new: true,
      runValidators: true,
    })
    .populate("bookIds", "title author coverImage totalPages currentPage status");
}

export async function deleteBookshelfService(id: string, userId: string) {
  await connect();
  return await bookshelfModel.findOneAndDelete({ _id: id, userId });
}
