import { Document } from 'mongoose';

export interface Book extends Document {
  title: string;
  author: string;
  image: string; 
  description?: string;
  publishedYear: number;
  genre: string;
  price: number;
  inStock: boolean;
  stockQuantity: number;
}
