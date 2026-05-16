import { Schema, model } from "mongoose";
import { Bookshelf } from "../interfaces/bookshelf";

const bookshelfSchema = new Schema<Bookshelf>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    bookIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Book",
      },
    ],
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

bookshelfSchema.index({ userId: 1, name: 1 }, { unique: true });

export const bookshelfModel = model<Bookshelf>("Bookshelf", bookshelfSchema);
