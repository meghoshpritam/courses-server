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

  public static getController = async ({
    userId,
    courseId,
    courseIds,
    courseDetails = false,
    withRatings = true,
    ratingUser = false,
  }: {
    userId?: string;
    courseId?: string;
    courseIds?: string[];
    courseDetails?: boolean;
    withRatings?: boolean;
    ratingUser?: boolean;
  }): Promise<any> => {
    try {
      let query = CourseRatings.find({});

      if (courseIds) {
        let filter = [];

        courseIds?.forEach((id) => {
          filter.push({
            id,
          });
        });

        query = CourseRatings.find({ $or: [...filter] });
      } else if (userId && courseId) {
        query = CourseRatings.find({
          id: courseId,
          'ratings.user': userId,
        });
      } else if (userId) {
        query = CourseRatings.find({
          'ratings.user': userId,
        });
      } else if (courseId) {
        query = CourseRatings.find({
          id: courseId,
        });
      }

      if (courseDetails) {
        query = query.populate({
          path: 'id',
          select: 'name description price img video updated creator',
          populate: { path: 'creator', select: 'name' },
        });
      }

      if (ratingUser) {
        query = query.populate({ path: 'ratings', populate: { path: 'user', select: 'name' } });
      }
      const ratings: CourseRating[] = await query.exec();

      let returnRatings = [];
      let totalRating = 0,
        totalUser = 0;
      ratings.forEach((rating: any) => {
        totalRating = totalUser = 0;
        rating.ratings.forEach((sURating) => {
          totalUser += 1;
          totalRating += sURating.rating;
        });

        if (withRatings) {
          returnRatings.push({
            ...rating.id._doc,
            ratings: [...rating.ratings],
            totalUserRating: totalUser,
            rating: (totalRating / totalUser).toFixed(1),
          });
        } else {
          returnRatings.push({
            ...rating.id._doc,
            totalUserRating: totalUser,
            rating: (totalRating / totalUser).toFixed(1),
          });
        }
      });

      return returnRatings;
    } catch (err) {
      throw err;
    }
  };

  // TODO: test all and add populate in get
  public static get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { userId, courseId } = req.query;

    try {
      const ratings = await CourseRatingController.getController({
        courseId: courseId.toString(),
        userId: courseId.toString(),
      });

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
              errors: [{ param: 'id', msg: 'Invalid course id' }],
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

      const rating: CourseRating = await CourseRatings.findOne({
        id,
        'ratings.user': res.locals.id,
      }).exec();

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
