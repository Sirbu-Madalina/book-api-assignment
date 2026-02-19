import { Request, Response } from 'express';
import { bookModel } from '../models/bookModel';
import { connect, disconnect } from '../repository/database';

// Creates a new book in the data source based on the request
export async function createBook(req: Request, res: Response): Promise<void> {
  const data = req.body;

  try {
    await connect();

    const book = new bookModel(data);
    const result = await book.save();

    res.status(201).send(result);
  } catch (error) {
    // Mongoose validation error → 400 means: “client sent bad data”
    if (error instanceof Error && (error as any).name === 'ValidationError') {
      res.status(400).send(error.message);
      return;
    }

    //500 means: “server/database crashed”
    res.status(500).send('Error in creating the book');
  } finally {
    await disconnect();
  }
}
