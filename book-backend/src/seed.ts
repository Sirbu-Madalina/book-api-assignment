import bcrypt from "bcrypt";
import dotenvFlow from "dotenv-flow";
import { bookModel } from "./models/bookModel";
import { bookshelfModel } from "./models/bookshelfModel";
import { userModel } from "./models/userModel";
import { connect, disconnect } from "./repository/database";

dotenvFlow.config();

const demoUser = {
  name: "John Smith",
  email: "john.smith@example.com",
  password: "12345678",
};

const books = [
  {
    title: "Atomic Habits",
    author: "James Clear",
    coverImage: "https://covers.openlibrary.org/b/id/12539781-L.jpg",
    description: "A practical guide to building better habits one small choice at a time.",
    genre: "Self-help",
    totalPages: 320,
    currentPage: 86,
    status: "currently-reading",
    isFavorite: true,
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    coverImage: "https://covers.openlibrary.org/b/id/6979861-L.jpg",
    description: "Bilbo Baggins leaves the Shire for an unexpected adventure.",
    genre: "Fantasy",
    totalPages: 310,
    currentPage: 310,
    status: "finished",
    isFavorite: true,
    finishedAt: new Date("2026-03-12"),
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    coverImage: "https://covers.openlibrary.org/b/id/12119420-L.jpg",
    description: "Politics, ecology, and prophecy collide on the desert planet Arrakis.",
    genre: "Science fiction",
    totalPages: 688,
    currentPage: 142,
    status: "currently-reading",
    isFavorite: false,
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    coverImage: "https://covers.openlibrary.org/b/id/12645166-L.jpg",
    description: "A sharp, romantic comedy of manners about love and first impressions.",
    genre: "Classic",
    totalPages: 432,
    currentPage: 0,
    status: "want-to-read",
    isFavorite: false,
  },
  {
    title: "The Midnight Library",
    author: "Matt Haig",
    coverImage: "https://covers.openlibrary.org/b/id/10523338-L.jpg",
    description: "A woman explores possible versions of her life in a magical library.",
    genre: "Fiction",
    totalPages: 304,
    currentPage: 304,
    status: "finished",
    isFavorite: true,
    finishedAt: new Date("2026-04-03"),
  },
  {
    title: "Educated",
    author: "Tara Westover",
    coverImage: "https://covers.openlibrary.org/b/id/9259256-L.jpg",
    description: "A memoir about family, survival, and the power of education.",
    genre: "Memoir",
    totalPages: 352,
    currentPage: 74,
    status: "currently-reading",
    isFavorite: false,
  },
  {
    title: "The Name of the Wind",
    author: "Patrick Rothfuss",
    coverImage: "https://covers.openlibrary.org/b/id/6283693-L.jpg",
    description: "Kvothe tells the story of his youth, music, magic, and legend.",
    genre: "Fantasy",
    totalPages: 662,
    currentPage: 0,
    status: "want-to-read",
    isFavorite: false,
  },
  {
    title: "Circe",
    author: "Madeline Miller",
    coverImage: "https://covers.openlibrary.org/b/id/8324081-L.jpg",
    description: "A mythic retelling centered on the witch Circe.",
    genre: "Fantasy",
    totalPages: 393,
    currentPage: 393,
    status: "finished",
    isFavorite: true,
    finishedAt: new Date("2026-01-22"),
  },
  {
    title: "Project Hail Mary",
    author: "Andy Weir",
    coverImage: "https://covers.openlibrary.org/b/id/10483140-L.jpg",
    description: "A lone astronaut wakes up with a mission to save humanity.",
    genre: "Science fiction",
    totalPages: 496,
    currentPage: 218,
    status: "currently-reading",
    isFavorite: false,
  },
  {
    title: "The Seven Husbands of Evelyn Hugo",
    author: "Taylor Jenkins Reid",
    coverImage: "https://covers.openlibrary.org/b/id/12879027-L.jpg",
    description: "An aging Hollywood icon reveals the truth behind her glamorous life.",
    genre: "Fiction",
    totalPages: 400,
    currentPage: 0,
    status: "want-to-read",
    isFavorite: false,
  },
  {
    title: "Sapiens",
    author: "Yuval Noah Harari",
    coverImage: "https://covers.openlibrary.org/b/id/8370221-L.jpg",
    description: "A broad history of humankind from early humans to modern societies.",
    genre: "History",
    totalPages: 464,
    currentPage: 122,
    status: "currently-reading",
    isFavorite: false,
  },
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    coverImage: "https://covers.openlibrary.org/b/id/8231990-L.jpg",
    description: "A shepherd follows a dream in search of treasure and purpose.",
    genre: "Fiction",
    totalPages: 208,
    currentPage: 208,
    status: "finished",
    isFavorite: false,
    finishedAt: new Date("2026-02-08"),
  },
  {
    title: "Tomorrow, and Tomorrow, and Tomorrow",
    author: "Gabrielle Zevin",
    coverImage: "https://covers.openlibrary.org/b/id/12964452-L.jpg",
    description: "A story of friendship, art, ambition, and video games.",
    genre: "Fiction",
    totalPages: 416,
    currentPage: 0,
    status: "want-to-read",
    isFavorite: false,
  },
  {
    title: "The Fellowship of the Ring",
    author: "J.R.R. Tolkien",
    coverImage: "https://covers.openlibrary.org/b/id/8231856-L.jpg",
    description: "The first part of the journey to destroy the One Ring.",
    genre: "Fantasy",
    totalPages: 423,
    currentPage: 0,
    status: "want-to-read",
    isFavorite: false,
  },
  {
    title: "Deep Work",
    author: "Cal Newport",
    coverImage: "https://covers.openlibrary.org/b/id/8232008-L.jpg",
    description: "A case for focused work in a distracted world.",
    genre: "Productivity",
    totalPages: 304,
    currentPage: 64,
    status: "currently-reading",
    isFavorite: false,
  },
] as const;

async function upsertDemoUser() {
  const password = await bcrypt.hash(demoUser.password, 10);
  const existingUser = await userModel.findOne({ email: demoUser.email });

  if (existingUser) {
    existingUser.name = demoUser.name;
    existingUser.password = password;
    existingUser.yearlyReadingGoal = 24;
    return existingUser.save();
  }

  return userModel.create({
    name: demoUser.name,
    email: demoUser.email,
    password,
    yearlyReadingGoal: 24,
  });
}

async function seedBooks(userId: string) {
  const savedBooks = [];

  for (const book of books) {
    const savedBook = await bookModel.findOneAndUpdate(
      { userId, title: book.title },
      { ...book, userId },
      {
        returnDocument: "after",
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    savedBooks.push(savedBook);
  }

  return savedBooks;
}

async function seedShelves(userId: string, savedBooks: Awaited<ReturnType<typeof seedBooks>>) {
  const byGenre = (genre: string) =>
    savedBooks.filter((book) => book.genre === genre).map((book) => book._id);

  const shelves = [
    {
      name: "Summer books",
      description: "Easy picks and memorable fiction for sunny reading days.",
      bookIds: savedBooks.slice(0, 5).map((book) => book._id),
    },
    {
      name: "Fantasy",
      description: "Magic, myth, and big journeys.",
      bookIds: byGenre("Fantasy"),
    },
    {
      name: "Currently Reading",
      description: "Books already in progress.",
      bookIds: savedBooks
        .filter((book) => book.status === "currently-reading")
        .map((book) => book._id),
    },
  ];

  for (const shelf of shelves) {
    await bookshelfModel.findOneAndUpdate(
      { userId, name: shelf.name },
      { ...shelf, userId },
      {
        returnDocument: "after",
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );
  }
}

async function seed() {
  await connect();

  const user = await upsertDemoUser();
  const savedBooks = await seedBooks(user._id.toString());
  await seedShelves(user._id.toString(), savedBooks);

  console.log(`Seeded ${savedBooks.length} books for ${demoUser.email}`);
  console.log(`Demo password: ${demoUser.password}`);
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnect();
  });
