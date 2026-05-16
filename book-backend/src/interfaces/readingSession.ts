import { Document, Types } from "mongoose";

export interface ReadingSession extends Document {
  userId: Types.ObjectId;
  bookId: Types.ObjectId;
  minutesRead: number;
  pagesRead: number;
  note?: string;
  readAt: Date;
}
