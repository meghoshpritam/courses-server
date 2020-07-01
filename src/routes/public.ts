import { Router } from 'express';
import authRouters from './auth';
import CourseController from '../controllers/CourseController';
import HomePageController from '../controllers/pageController/HomePageController';

const routes: Router = Router();

// auth routes
routes.use('/auth', authRouters);

/************************************ Public pages routes ******************************************/
// home page
routes.get('/pages/home', HomePageController.get);

// get all courses
routes.get('/courses', CourseController.get);

export default routes;
