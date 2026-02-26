import { Request, Response } from "express";
import * as bookService from "../services/bookService";

type IdParams = { id: string };

// Create book
export async function createBook(req: Request, res: Response): Promise<void> {
  try {
    const result = await bookService.createBookService(req.body);
    res.status(201).send(result);
  } catch (error: any) {
    if (error?.name === "ValidationError") {
      res.status(400).send(error.message);
      return;
    }
    res.status(500).send("Error in creating the book");
  }
}

// Get all books
export async function getAllBooks(req: Request, res: Response): Promise<void> {
  try {
    const result = await bookService.getAllBooksService();
    res.status(200).send(result);
  } catch {
    res.status(500).send("Error in retriving books");
  }
}

// Get book by id
export async function getBookById(req: Request<IdParams>, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const result = await bookService.getBookByIdService(id);

    if (!result) {
      res.status(404).send("Book not found");
      return;
    }

    res.status(200).send(result);
  } catch {
    res.status(500).send("Error in retriving book by id");
  }
}

// Update book by id
export async function updateBookById(req: Request<IdParams>, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const result = await bookService.updateBookByIdService(id, req.body);

    if (!result) {
      res.status(404).send("Cannot update book with id=" + id);
      return;
    }

    // returns updated book doc
    res.status(200).send(result);
  } catch (error: any) {
    if (error?.name === "ValidationError") {
      res.status(400).send(error.message);
      return;
    }
    res.status(500).send("Error in updating book by id");
  }
}

// Delete book by id
export async function deleteBookById(req: Request<IdParams>, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const result = await bookService.deleteBookByIdService(id);

    if (!result) {
      res.status(404).send("Cannot delete book with id=" + id);
      return;
    }

    res.status(200).send({ message: "Book was successfully deleted.", id });
  } catch {
    res.status(500).send("Error in deleting book by id");
  }
}