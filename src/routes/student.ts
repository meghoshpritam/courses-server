import { Router, Request, Response, NextFunction } from 'express';
import MyCourseController from '../controllers/MyCourseController';
import TransactionController from '../controllers/TransactionController';
import RatingController from '../controllers/RatingController';
import CourseRatingController from '../controllers/CourseRatingController';

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

// update a rating
routes.put(
  '/ratings/course',
  CourseRatingController.update.validate,
  CourseRatingController.update.controller
);

// delete a course rating
routes.delete('/ratings/course', CourseRatingController.delete);

export default routes;
