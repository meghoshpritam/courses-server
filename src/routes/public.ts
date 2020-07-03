import { Router } from 'express';
import authRouters from './auth';
import CourseController from '../controllers/CourseController';
import HomePageController from '../controllers/pageController/HomePageController';
import CoursePageController from '../controllers/pageController/CoursePageController';

const routes: Router = Router();

// auth routes
routes.use('/auth', authRouters);

/************************************ Public pages routes ******************************************/
// home page
routes.get('/pages/home', HomePageController.get);

// course page
routes.get('/course', CoursePageController.publicCourseGet, CourseController.get);

export default routes;
