import { Response } from "express";
import Joi from "joi";
import { AuthRequest } from "./authController";
import * as readingSessionService from "../services/readingSessionService";

type IdParams = { id: string };

export async function createReadingSession(
  req: AuthRequest,
  res: Response
): Promise<void> {
  if (!req.user?.id) {
    res.status(401).send("Unauthorized");
    return;
  }

  const { error, value } = validateReadingSession(req.body);

  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }

  if (value.minutesRead === 0 && value.pagesRead === 0) {
    res.status(400).json({ error: "Add minutes or pages before saving." });
    return;
  }

  try {
    const result = await readingSessionService.createReadingSessionService(
      value,
      req.user.id
    );

    if (!result) {
      res.status(404).send("Book not found");
      return;
    }

    res.status(201).send(result);
  } catch (error: any) {
    if (error?.name === "ValidationError") {
      res.status(400).send(error.message);
      return;
    }

    res.status(500).send("Error in creating reading session");
  }
}

export async function getReadingSessions(
  req: AuthRequest,
  res: Response
): Promise<void> {
  if (!req.user?.id) {
    res.status(401).send("Unauthorized");
    return;
  }

  try {
    const sessions = await readingSessionService.getReadingSessionsService(
      req.user.id
    );
    res.status(200).send(sessions);
  } catch {
    res.status(500).send("Error in retrieving reading sessions");
  }
}

export async function deleteReadingSession(
  req: AuthRequest & { params: IdParams },
  res: Response
): Promise<void> {
  if (!req.user?.id) {
    res.status(401).send("Unauthorized");
    return;
  }

  try {
    const deleted = await readingSessionService.deleteReadingSessionService(
      req.params.id,
      req.user.id
    );

    if (!deleted) {
      res.status(404).send("Reading session not found");
      return;
    }

    res.status(200).send({
      message: "Reading session was successfully deleted.",
      books: deleted.books,
    });
  } catch {
    res.status(500).send("Error in deleting reading session");
  }
}

export async function updateReadingSession(
  req: AuthRequest & { params: IdParams },
  res: Response
): Promise<void> {
  if (!req.user?.id) {
    res.status(401).send("Unauthorized");
    return;
  }

  const { error, value } = validateReadingSessionUpdate(req.body);

  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }

  if (value.minutesRead === 0 && value.pagesRead === 0) {
    res.status(400).json({ error: "Add minutes or pages before saving." });
    return;
  }

  try {
    const result = await readingSessionService.updateReadingSessionService(
      req.params.id,
      value,
      req.user.id
    );

    if (!result) {
      res.status(404).send("Reading session or book not found");
      return;
    }

    res.status(200).send(result);
  } catch (error: any) {
    if (error?.name === "ValidationError") {
      res.status(400).send(error.message);
      return;
    }

    res.status(500).send("Error in updating reading session");
  }
}

function validateReadingSession(data: unknown) {
  const schema = Joi.object({
    bookId: Joi.string().required(),
    minutesRead: Joi.number().integer().min(0).required(),
    pagesRead: Joi.number().integer().min(0).required(),
    note: Joi.string().allow("").max(500).optional(),
    readAt: Joi.date().optional(),
  });

  return schema.validate(data);
}

function validateReadingSessionUpdate(data: unknown) {
  const schema = Joi.object({
    bookId: Joi.string().optional(),
    minutesRead: Joi.number().integer().min(0).optional(),
    pagesRead: Joi.number().integer().min(0).optional(),
    note: Joi.string().allow("").max(500).optional(),
    readAt: Joi.date().optional(),
  }).min(1);

  return schema.validate(data);
}
