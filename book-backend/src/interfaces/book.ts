import { Document, Types } from "mongoose";

export type ReadingStatus = "want-to-read" | "currently-reading" | "finished";

export interface Book extends Document {
  title: string;
  author: string;
  coverImage: string;
  description?: string;
  genre: string;
  totalPages: number;
  currentPage: number;
  status: ReadingStatus;
  startedAt?: Date;
  finishedAt?: Date;
  targetDate?: Date;
  isFavorite: boolean;
  userId: Types.ObjectId;
}