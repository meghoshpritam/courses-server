import Goals, { Goal } from './../entity/Goals';
import GoalRatings, { GoalRating } from './../entity/GoalRatings';
import { find } from 'lodash';
import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

class GoalRatingController {
  public static writeValidation = [
    body('id').not().isEmpty().withMessage('Goal Id is required'),
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
    const { userId, goalId } = req.query;

    try {
      if (userId && goalId) {
        const rating: GoalRating = await GoalRatings.findOne({
          id: goalId,
          'ratings.user': userId,
        }).exec();

        res.status(200).json({ ratings: rating });
        return;
      }
      if (userId) {
        const ratings: GoalRating = await GoalRatings.findOne({
          'ratings.user': userId,
        }).exec();

        res.status(200).json({ ratings });
        return;
      }
      if (goalId) {
        const ratings: GoalRating = await GoalRatings.findOne({
          id: goalId,
        }).exec();

        res.status(200).json({ ratings });
        return;
      }

      const ratings: GoalRating = await GoalRatings.findOne({}).exec();

      res.status(200).json({ ratings });
    } catch (err) {
      next(err);
    }
  };

  public static post = {
    validate: [...GoalRatingController.writeValidation],
    controller: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { id, rating, comment } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        next({ __src__: 'express-validator', errors });
        return;
      }

      try {
        const goalRating: GoalRating = await GoalRatings.findOne({ id }).exec();

        if (!goalRating) {
          const goal: Goal = await Goals.findOne({ _id: id }).exec();

          if (!goal) {
            next({
              __src__: 'validator',
              errors: [{ param: 'id', msg: 'Invalid goal rating' }],
            });
            return;
          }

          const newRating = new GoalRatings({
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

        if (find(goalRating.ratings, (obj) => obj.user.toString() === res.locals.id)) {
          next({
            __src__: 'validator',
            errors: [{ param: 'rating', msg: 'You already rated the goal' }],
          });
          return;
        }

        await GoalRatings.updateOne(
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
    validate: [...GoalRatingController.writeValidation],
    controller: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { id, rating, comment } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        next({ __src__: 'express-validator', errors });
        return;
      }

      try {
        const goalRating: GoalRating = await GoalRatings.findOne({
          id,
          ratings: { $elemMatch: { user: res.locals.id } },
        }).exec();

        if (!goalRating) {
          next({
            __src__: 'validator',
            errors: [{ param: 'id', msg: 'Not rated yet to update' }],
          });
          return;
        }

        await GoalRatings.updateOne(
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
          errors: [{ param: 'id', msg: 'Goal id is required' }],
        });
        return;
      }

      const rating = await GoalRatings.find({ id, 'ratings.user': res.locals.id }).exec();

      if (!rating) {
        next({
          __src__: 'validator',
          errors: [{ param: 'id', msg: 'You are not rate the goal to delete the rating' }],
        });
        return;
      }

      await GoalRatings.updateOne({ id }, { $pull: { ratings: { user: res.locals.id } } }).exec();

      res.status(204).json({ msg: `${res.locals.name} you delete your rating` });
    } catch (err) {
      next(err);
    }
  };
}

export default GoalRatingController;
