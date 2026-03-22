import { Schema, model } from "mongoose";
import { Book } from "../interfaces/book";

const bookSchema = new Schema<Book>(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    coverImage: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    genre: { type: String, trim: true },

    totalPages: { type: Number, required: true, min: 1 },
    currentPage: { type: Number, default: 0, min: 0 },

    status: {
      type: String,
      required: true,
      enum: ["want-to-read", "currently-reading", "finished"],
      default: "want-to-read",
    },

    startedAt: { type: Date },
    finishedAt: { type: Date },
    targetDate: { type: Date },

    isFavorite: { type: Boolean, default: false },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const bookModel = model<Book>("Book", bookSchema);