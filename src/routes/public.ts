import { Router } from 'express';

import authRouters from './auth';
import transactionRoutes from './transaction';
import CourseController from '../controllers/CourseController';

const routes: Router = Router();

// auth routes
routes.use('/auth', authRouters);

// public pages
// home page
routes.get('/pages/home');

// get all courses
routes.get('/courses', CourseController.get);

export default routes;
