import { Router, Request, Response } from "express";
import {
  createBook,
  getAllBooks,
  getBookById,
  updateBookById,
  deleteBookById,
} from "./controllers/bookController";
import { registerUser, loginUser, verifyToken } from "./controllers/authController";

const router: Router = Router();

/**
 * @swagger
 * /:
 *   get:
 *     tags:
 *       - App
 *     summary: Health check
 *     description: Basic route to check if the API is running
 *     responses:
 *       200:
 *         description: API is running
 */
router.get("/", (req: Request, res: Response) => {
  res.status(200).send("Welcome to the Book Tracking API");
});

// Auth routes

/**
 * @swagger
 * /user/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user
 *     description: Creates a new user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterUserInput'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already exists
 *       500:
 *         description: Server error
 */
router.post("/user/register", registerUser);

/**
 * @swagger
 * /user/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login an existing user
 *     description: Authenticates user and returns a JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginUserInput'
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials or validation error
 *       500:
 *         description: Server error
 */
router.post("/user/login", loginUser);

// Book routes

/**
 * @swagger
 * /books:
 *   post:
 *     tags:
 *       - Books
 *     summary: Create a new book for the authenticated user
 *     description: Adds a new book to the logged-in user's personal reading tracker
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBookInput'
 *     responses:
 *       201:
 *         description: Book created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized or invalid token
 *       500:
 *         description: Server error
 *   get:
 *     tags:
 *       - Books
 *     summary: Get all books for the authenticated user
 *     description: Returns all books belonging to the logged-in user
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: List of books
 *       401:
 *         description: Unauthorized or invalid token
 *       500:
 *         description: Server error
 */
router.post("/books", verifyToken, createBook);
router.get("/books", verifyToken, getAllBooks);

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     tags:
 *       - Books
 *     summary: Get one book by ID
 *     description: Returns one book belonging to the logged-in user
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Book ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book found
 *       401:
 *         description: Unauthorized or invalid token
 *       404:
 *         description: Book not found
 *       500:
 *         description: Server error
 *   put:
 *     tags:
 *       - Books
 *     summary: Update a book by ID
 *     description: Updates a book belonging to the logged-in user
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Book ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBookInput'
 *     responses:
 *       200:
 *         description: Book updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized or invalid token
 *       404:
 *         description: Book not found
 *       500:
 *         description: Server error
 *   delete:
 *     tags:
 *       - Books
 *     summary: Delete a book by ID
 *     description: Deletes a book belonging to the logged-in user
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Book ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book deleted successfully
 *       401:
 *         description: Unauthorized or invalid token
 *       404:
 *         description: Book not found
 *       500:
 *         description: Server error
 */
router.get("/books/:id", verifyToken, getBookById);
router.put("/books/:id", verifyToken, updateBookById);
router.delete("/books/:id", verifyToken, deleteBookById);

export default router;