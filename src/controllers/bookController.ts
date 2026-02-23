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


//Retrives books
export async function getAllBooks(req: Request, res: Response){
  
  try {
    await connect();

    const result = await bookModel.find({});

    res.status(200).send(result);
  } catch (error) {
    if (error instanceof Error && (error as any).name === 'RetrivingBooksError') {
      res.status(400).send(error.message);
      return;
    }

    res.status(500).send('Error in retriving books');
  } finally {
    await disconnect();
  }
}

//Retrive book by id
export async function getProductById(req: Request, res: Response){
  
  try {
    await connect();

    const id = req.params.id;
    const result = await bookModel.find({_id: id});

    res.status(200).send(result);
  } catch (error) {
    if (error instanceof Error && (error as any).name === 'RetrivingBookIdError') {
      res.status(400).send(error.message);
      return;
    }

    res.status(500).send('Error in retriving book by id');
  } finally {
    await disconnect();
  }
}

//Update book by id
export async function updateProductByID(req: Request, res: Response){
  
  const id = req.params.id;

  try {
    await connect();

    const result = await bookModel.findByIdAndUpdate(id, req.body);

    if (!result){
      res.status(404).send('Cannot update book with id=' + id);
    }
    else {
      res.status (200).send('Book was succesfully updated.');
    }
  } catch (error) {
    if (error instanceof Error && (error as any).name === 'UpdatingBookIdError') {
      res.status(400).send(error.message);
      return;
    }

    res.status(500).send('Error in updating book by id');
  } finally {
    await disconnect();
  }
}

//Update book by id
export async function deleteProductByID(req: Request, res: Response){
  
  const id = req.params.id;

  try {
    await connect();

    const result = await bookModel.findByIdAndDelete(id);

    if (!result){
      res.status(404).send('Cannot delete book with id=' + id);
    }
    else {
      res.status (200).send('Book was succesfully deleted.');
    }
  } catch (error) {
    if (error instanceof Error && (error as any).name === 'DeletingBookIdError') {
      res.status(400).send(error.message);
      return;
    }

    res.status(500).send('Error in deleting book by id');
  } finally {
    await disconnect();
  }
}