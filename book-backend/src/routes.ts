import { Router, Request, Response } from 'express';
import { createBook, getAllBooks, getBookById, updateBookById, deleteBookById } from './controllers/bookController';import {registerUser, loginUser, verifyToken} from './controllers/authController';
const router: Router = Router();


/**
 * @swagger
 * /:
 *   get:
 *     tags:
 *       - App Routes
 *     summary: Health check
 *     description: Basic route to check if the API is running
 *     responses:
 *       200:
 *         description: Server is running
 */

router.get('/', (req: Request, res: Response)=> {
    res.status(200).send('Welcome to the Book Catalog');
});

//Auth
/**
 * @swagger
 * /user/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */
router.post('/user/register', registerUser);

/**
 * @swagger
 * /user/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login an existing user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials or validation error
 *       500:
 *         description: Server error
 */
router.post ('/user/login', loginUser);

//CRUD
/**
 * @swagger
 * /books:
 *   post:
 *     tags:
 *       - Books
 *     summary: Create a new book
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       201:
 *         description: Book created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid token
 *       500:
 *         description: Server error
 *   get:
 *     tags:
 *       - Books
 *     summary: Retrieve all books
 *     responses:
 *       200:
 *         description: List of books
 *       500:
 *         description: Server error
 */
router.post('/books', verifyToken, createBook);
router.get('/books', getAllBooks);

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     tags:
 *       - Books
 *     summary: Retrieve a book by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book found
 *       400:
 *         description: Invalid id
 *       500:
 *         description: Server error
 *   put:
 *     tags:
 *       - Books
 *     summary: Update a book by id
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       200:
 *         description: Book updated successfully
 *       401:
 *         description: Invalid token
 *       404:
 *         description: Book not found
 *       500:
 *         description: Server error
 *   delete:
 *     tags:
 *       - Books
 *     summary: Delete a book by id
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book deleted successfully
 *       401:
 *         description: Invalid token
 *       404:
 *         description: Book not found
 *       500:
 *         description: Server error
 */
router.get('/books/:id', getBookById);

router.put('/books/:id', verifyToken, updateBookById);
router.delete('/books/:id', verifyToken, deleteBookById);




export default router;
