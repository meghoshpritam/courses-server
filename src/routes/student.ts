import { Router } from 'express';
import MyCourseController from '../controllers/MyCourseController';
import TransactionController from '../controllers/TransactionController';

const routes: Router = Router();

/************************************ MyCourses ******************************************/
// get my courses
routes.get('/myCourses', MyCourseController.get);

// create an order
routes.post('/create-order', TransactionController.createOrder);

// verify an order
routes.post('/verify-order', TransactionController.verifyOrder);

export default routes;
