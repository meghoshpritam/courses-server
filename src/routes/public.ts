import { Router } from 'express';

import authRouters from './auth';
import transactionRoutes from './transaction';

const routes: Router = Router();

// auth routes
routes.use('/auth', authRouters);

// test transaction
routes.use('/transaction', transactionRoutes);

export default routes;
