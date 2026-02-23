import { Router, Request, Response } from 'express';
import { createBook, getAllBooks, getProductById, updateProductByID, deleteProductByID } from './controllers/bookController';
import {registerUser} from './controllers/authController';
const router: Router = Router();

router.get('/', (req: Request, res: Response)=> {
    res.status(200).send('Welcome to the Book Catalog');
});

//Auth
router.post('/user/register', registerUser);

//CRUD
router.post('/books', createBook);
router.get('/books', getAllBooks);
router.get('/books/:id', getProductById);
router.put ('/books/:id', updateProductByID);
router.delete ('/books/:id', deleteProductByID);




export default router;