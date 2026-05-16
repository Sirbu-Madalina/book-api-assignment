import { Response } from "express";
import Joi from "joi";
import { AuthRequest } from "./authController";
import * as bookshelfService from "../services/bookshelfService";

type IdParams = { id: string };

export async function createBookshelf(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user?.id) {
    res.status(401).send("Unauthorized");
    return;
  }

  const { error, value } = validateBookshelf(req.body);

  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }

  try {
    const shelf = await bookshelfService.createBookshelfService(value, req.user.id);
    res.status(201).send(shelf);
  } catch (error: any) {
    if (error?.code === 11000) {
      res.status(409).send("A bookshelf with this name already exists.");
      return;
    }

    if (error?.name === "ValidationError") {
      res.status(400).send(error.message);
      return;
    }

    res.status(500).send("Error in creating bookshelf");
  }
}

export async function getBookshelves(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user?.id) {
    res.status(401).send("Unauthorized");
    return;
  }

  try {
    const shelves = await bookshelfService.getBookshelvesService(req.user.id);
    res.status(200).send(shelves);
  } catch {
    res.status(500).send("Error in retrieving bookshelves");
  }
}

export async function updateBookshelf(
  req: AuthRequest & { params: IdParams },
  res: Response
): Promise<void> {
  if (!req.user?.id) {
    res.status(401).send("Unauthorized");
    return;
  }

  const { error, value } = validateBookshelfUpdate(req.body);

  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }

  try {
    const shelf = await bookshelfService.updateBookshelfService(
      req.params.id,
      value,
      req.user.id
    );

    if (!shelf) {
      res.status(404).send("Bookshelf not found");
      return;
    }

    res.status(200).send(shelf);
  } catch (error: any) {
    if (error?.code === 11000) {
      res.status(409).send("A bookshelf with this name already exists.");
      return;
    }

    if (error?.name === "ValidationError") {
      res.status(400).send(error.message);
      return;
    }

    res.status(500).send("Error in updating bookshelf");
  }
}

export async function deleteBookshelf(
  req: AuthRequest & { params: IdParams },
  res: Response
): Promise<void> {
  if (!req.user?.id) {
    res.status(401).send("Unauthorized");
    return;
  }

  try {
    const deleted = await bookshelfService.deleteBookshelfService(
      req.params.id,
      req.user.id
    );

    if (!deleted) {
      res.status(404).send("Bookshelf not found");
      return;
    }

    res.status(200).send({ message: "Bookshelf was successfully deleted." });
  } catch {
    res.status(500).send("Error in deleting bookshelf");
  }
}

function validateBookshelf(data: unknown) {
  const schema = Joi.object({
    name: Joi.string().trim().min(2).max(80).required(),
    description: Joi.string().allow("").max(300).optional(),
    bookIds: Joi.array().items(Joi.string()).default([]),
  });

  return schema.validate(data);
}

function validateBookshelfUpdate(data: unknown) {
  const schema = Joi.object({
    name: Joi.string().trim().min(2).max(80).optional(),
    description: Joi.string().allow("").max(300).optional(),
    bookIds: Joi.array().items(Joi.string()).optional(),
  }).min(1);

  return schema.validate(data);
}
