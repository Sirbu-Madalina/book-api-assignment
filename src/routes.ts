import { Router, Request, Response } from 'express';
import { createBook, getAllBooks, getProductById, updateProductByID, deleteProductByID } from './controllers/bookController';

const router: Router = Router();

router.get('/', (req: Request, res: Response)=> {
    res.status(200).send('Welcome to the Book Catalog');
});

router.post('/books', createBook);
router.get('/books', getAllBooks);
router.get('/books/:id', getProductById);
router.put ('/books/:id', updateProductByID);
router.delete ('/books/:id', deleteProductByID);



export default router;