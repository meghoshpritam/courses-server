import { checkRole } from '../middleware/checkRole';
import { checkAccessToken } from '../middleware/checkJwt';
import { Router } from 'express';
import Public from './public';
import Admin from './admin';
import Student from './student';

const routes: Router = Router();

// public routes
routes.use(Public);

// admin routes
routes.use('/admin', checkAccessToken, checkRole(['admin']), Admin);

// student routes
routes.use('/student', checkAccessToken, checkRole(['student', 'admin']), Student);

export default routes;
