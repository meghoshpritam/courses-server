import { checkRole } from './../middlewares/checkRole';
import { checkAccessToken } from './../middlewares/checkJwt';
import { Router } from 'express';
import Public from './public';
import Admin from './admin';

const routes: Router = Router();

// public routes
routes.use(Public);

// admin routes
routes.use('/admin', checkAccessToken, checkRole(['admin']), Admin);

export default routes;
