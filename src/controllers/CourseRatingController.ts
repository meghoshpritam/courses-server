import { find } from 'lodash';
import Courses, { Course } from './../entity/Courses';
import { Request, Response, NextFunction } from 'express';
import CourseRatings, { CourseRating } from '../entity/CourseRatings';
import { body, validationResult } from 'express-validator';

class CourseRatingController {
  public static writeValidation = [
    body('id').not().isEmpty().withMessage('Course Id is required'),
    body('rating')
      .not()
      .isEmpty()
      .withMessage('Rating is required')
      .toInt()
      .custom((value) => {
        if (value < 1) throw Error('Min rating is 1!');
        if (value > 5) throw Error('Max rating is 5!');

        // pass the validation
        return true;
      }),
  ];

  // TODO: test all and add populate in get
  public static get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { userId, courseId } = req.query;

    try {
      if (userId && courseId) {
        const rating: CourseRating = await CourseRatings.findOne({
          id: courseId,
          'ratings.user': userId,
        }).exec();

        res.status(200).json({ ratings: rating });
        return;
      }
      if (userId) {
        const ratings: CourseRating = await CourseRatings.findOne({
          'ratings.user': userId,
        }).exec();

        res.status(200).json({ ratings });
        return;
      }
      if (courseId) {
        const ratings: CourseRating = await CourseRatings.findOne({
          id: courseId,
        }).exec();

        res.status(200).json({ ratings });
        return;
      }

      const ratings: CourseRating = await CourseRatings.findOne({}).exec();

      res.status(200).json({ ratings });
    } catch (err) {
      next(err);
    }
  };

  public static post = {
    validate: [...CourseRatingController.writeValidation],
    controller: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { id, rating, comment } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        next({ __src__: 'express-validator', errors });
        return;
      }

      try {
        const courseRating: CourseRating = await CourseRatings.findOne({ id }).exec();

        if (!courseRating) {
          const course: Course = await Courses.findOne({ _id: id }).exec();

          if (!course) {
            next({
              __src__: 'validator',
              errors: [{ param: 'id', msg: 'Invalid course rating' }],
            });
            return;
          }

          const newRating = new CourseRatings({
            id,
            ratings: [
              {
                user: res.locals.id,
                rating,
                comment,
                date: new Date(),
              },
            ],
          });

          await newRating.save();

          res.status(202).json({ msg: `${res.locals.name} your rating is added` });
          return;
        }

        if (find(courseRating.ratings, (obj) => obj.user.toString() === res.locals.id)) {
          next({
            __src__: 'validator',
            errors: [{ param: 'rating', msg: 'You already rated the course' }],
          });
          return;
        }

        await CourseRatings.updateOne(
          { id },
          {
            $push: {
              ratings: {
                user: res.locals.id,
                date: new Date(),
                rating,
                comment,
              },
            },
          }
        ).exec();

        res.status(202).json({ msg: `${res.locals.name} your rating is added` });
      } catch (err) {
        next(err);
      }
    },
  };

  public static update = {
    validate: [...CourseRatingController.writeValidation],
    controller: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { id, rating, comment } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        next({ __src__: 'express-validator', errors });
        return;
      }

      try {
        const courseRating: CourseRating = await CourseRatings.findOne({
          id,
          ratings: { $elemMatch: { user: res.locals.id } },
        }).exec();

        if (!courseRating) {
          next({
            __src__: 'validator',
            errors: [{ param: 'id', msg: 'Not rated yet to update' }],
          });
          return;
        }

        await CourseRatings.updateOne(
          { id, 'ratings.user': res.locals.id },
          {
            $set: {
              'ratings.$.rating': rating,
              'ratings.$.comment': comment,
              'ratings.$.updated': new Date(),
            },
          }
        ).exec();

        res.status(202).json({ msg: `${res.locals.name} your rating is updated` });
      } catch (err) {
        next(err);
      }
    },
  };

  public static delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.query;

    try {
      if (!id) {
        next({
          __src__: 'validator',
          errors: [{ param: 'id', msg: 'Course id is required' }],
        });
        return;
      }

      const rating = await CourseRatings.find({ id, 'ratings.user': res.locals.id }).exec();

      if (!rating) {
        next({
          __src__: 'validator',
          errors: [{ param: 'id', msg: 'You are not rate the course to delete the rating' }],
        });
        return;
      }

      await CourseRatings.updateOne({ id }, { $pull: { ratings: { user: res.locals.id } } }).exec();

      res.status(204).json({ msg: `${res.locals.name} you delete your rating` });
    } catch (err) {
      next(err);
    }
  };
}

export default CourseRatingController;
