import { Schema, model } from "mongoose";
import { ReadingSession } from "../interfaces/readingSession";

const readingSessionSchema = new Schema<ReadingSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookId: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    minutesRead: { type: Number, required: true, min: 0 },
    pagesRead: { type: Number, required: true, min: 0 },
    note: { type: String, trim: true, default: "" },
    readAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const readingSessionModel = model<ReadingSession>(
  "ReadingSession",
  readingSessionSchema
);
