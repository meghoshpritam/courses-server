import { Router } from 'express';

import authRouters from './auth';

const routes: Router = Router();

// auth routes
routes.use('/auth', authRouters);

export default routes;
