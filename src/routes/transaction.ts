import { Router } from 'express';
import TransactionController from '../controllers/TransactionController';

const routes: Router = Router();

routes.get('/payment-capture', TransactionController.createOrder);

export default routes;
