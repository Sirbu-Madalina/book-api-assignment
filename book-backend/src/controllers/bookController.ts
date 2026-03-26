import { Response } from "express";
import * as bookService from "../services/bookService";
import { AuthRequest } from "./authController";

type IdParams = { id: string };

function isNonEmptyString(v: unknown) {
  return typeof v === "string" && v.trim().length > 0;
}

export async function createBook(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user?.id) {
      res.status(401).send("Unauthorized");
      return;
    }

    if (!isNonEmptyString(req.body?.coverImage)) {
      res.status(400).send("Cover image is required");
      return;
    }

    const result = await bookService.createBookService(req.body, req.user.id);
    res.status(201).send(result);
  } catch (error: any) {
    if (error?.name === "ValidationError") {
      res.status(400).send(error.message);
      return;
    }

    res.status(500).send("Error in creating the book");
  }
}

export async function getAllBooks(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user?.id) {
      res.status(401).send("Unauthorized");
      return;
    }

    const result = await bookService.getAllBooksService(req.user.id);
    res.status(200).send(result);
  } catch {
    res.status(500).send("Error in retrieving books");
  }
}

export async function getBookById(req: AuthRequest & { params: IdParams }, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    if (!req.user?.id) {
      res.status(401).send("Unauthorized");
      return;
    }

    const result = await bookService.getBookByIdService(id, req.user.id);

    if (!result) {
      res.status(404).send("Book not found");
      return;
    }

    res.status(200).send(result);
  } catch {
    res.status(500).send("Error in retrieving book by id");
  }
}

export async function updateBookById(req: AuthRequest & { params: IdParams }, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    if (!req.user?.id) {
      res.status(401).send("Unauthorized");
      return;
    }

    if ("coverImage" in req.body && !isNonEmptyString(req.body?.coverImage)) {
      res.status(400).send("Cover image cannot be empty");
      return;
    }

    const result = await bookService.updateBookByIdService(id, req.body, req.user.id);

    if (!result) {
      res.status(404).send("Cannot update book with id=" + id);
      return;
    }

    res.status(200).send(result);
  } catch (error: any) {
    if (error?.name === "ValidationError") {
      res.status(400).send(error.message);
      return;
    }

    res.status(500).send("Error in updating book by id");
  }
}

export async function deleteBookById(req: AuthRequest & { params: IdParams }, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    if (!req.user?.id) {
      res.status(401).send("Unauthorized");
      return;
    }

    const result = await bookService.deleteBookByIdService(id, req.user.id);

    if (!result) {
      res.status(404).send("Cannot delete book with id=" + id);
      return;
    }

    res.status(200).send({ message: "Book was successfully deleted.", id });
  } catch {
    res.status(500).send("Error in deleting book by id");
  }
}