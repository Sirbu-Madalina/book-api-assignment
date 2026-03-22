import { bookModel } from "../models/bookModel";
import { connect, disconnect } from "../repository/database";

// Persists a new book document and returns the saved record
export async function createBookService(data: any) {
  try {
    await connect();
    const book = new bookModel(data);
    return await book.save();
  } finally {
    await disconnect();
  }
}

// Returns all books in the collection
export async function getAllBooksService() {
  try {
    await connect();
    return await bookModel.find({});
  } finally {
    await disconnect();
  }
}

// Finds a single book by id
export async function getBookByIdService(id: string) {
  try {
    await connect();
    return await bookModel.findById(id);
  } finally {
    await disconnect();
  }
}

// Updates book by id and returns the updated document
export async function updateBookByIdService(id: string, data: any) {
  try {
    await connect();

    return await bookModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  } finally {
    await disconnect();
  }
}

// Deletes a book by id
export async function deleteBookByIdService(id: string) {
  try {
    await connect();
    return await bookModel.findByIdAndDelete(id);
  } finally {
    await disconnect();
  }
}