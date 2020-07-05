import { Router, Request, Response, NextFunction } from 'express';
import MyCourseController from '../controllers/MyCourseController';
import TransactionController from '../controllers/TransactionController';
import RatingController from '../controllers/RatingController';
import CourseRatingController from '../controllers/CourseRatingController';
import GoalRatingController from '../controllers/GoalRatingController';
import ProjectRatingController from '../controllers/ProjectRatingController';

const routes: Router = Router();

/************************************ MyCourses ******************************************/
// get my courses
routes.get('/my-courses', MyCourseController.get);

// create an order
routes.post('/create-order', TransactionController.createOrder);

// verify an order
routes.post('/verify-order', TransactionController.verifyOrder);

/************************************ Ratings ******************************************/
// get my all rating
routes.get(
  '/my-ratings',
  (req: Request, res: Response, next: NextFunction) => {
    req.body.id = res.locals.id;
    next();
  },
  RatingController.get
);

// add a rating
routes.post('/my-rating', RatingController.postPut.validate, RatingController.postPut.controller);

// update a rating
routes.put('/my-rating', RatingController.postPut.validate, RatingController.postPut.controller);

// delete a rating
routes.delete('/my-rating', RatingController.delete);

// get all course ratings
routes.get('/ratings/course', CourseRatingController.get);

// give a rating to a course
routes.post(
  '/ratings/course',
  CourseRatingController.post.validate,
  CourseRatingController.post.controller
);

// update a course rating
routes.put(
  '/ratings/course',
  CourseRatingController.update.validate,
  CourseRatingController.update.controller
);

// delete a course rating
routes.delete('/ratings/course', CourseRatingController.delete);

// get all goal ratings
routes.get('/ratings/goal', GoalRatingController.get);

// give a rating to a goal
routes.post(
  '/ratings/goal',
  GoalRatingController.post.validate,
  GoalRatingController.post.controller
);

// update a goal rating
routes.put(
  '/ratings/goal',
  GoalRatingController.update.validate,
  GoalRatingController.update.controller
);

// delete a goal rating
routes.delete('/ratings/goal', GoalRatingController.delete);

// get all project ratings
routes.get('/ratings/project', ProjectRatingController.get);

// give a rating to a project
routes.post(
  '/ratings/project',
  ProjectRatingController.post.validate,
  ProjectRatingController.post.controller
);

// update a project rating
routes.put(
  '/ratings/project',
  ProjectRatingController.update.validate,
  ProjectRatingController.update.controller
);

// delete a project rating
routes.delete('/ratings/project', ProjectRatingController.delete);

export default routes;
