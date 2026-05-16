import { Document, Types } from "mongoose";

export interface Bookshelf extends Document {
  name: string;
  description?: string;
  bookIds: Types.ObjectId[];
  userId: Types.ObjectId;
}
