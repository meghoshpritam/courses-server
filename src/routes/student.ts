import { Router } from 'express';
import MyCourseController from '../controllers/MyCourseController';

const routes: Router = Router();

/************************************ MyCourses ******************************************/
// get my courses
routes.get('/myCourses', MyCourseController.get);

export default routes;
