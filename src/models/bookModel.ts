import { Schema, model } from 'mongoose';
import { Book } from '../interfaces/book';

const bookSchema = new Schema<Book>({
  title: {type: String, required: true},
  author: {type: String, required: true},
  description: {type: String, required: true},
  publishedYear: {type: Number, required: true},
  genre: {type: String, required: true},
  price: {type: Number, required: true},
  inStock: {type: Boolean, required: true, default: true}
});

export const bookModel = model<Book>('Book', bookSchema);
