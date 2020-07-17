import { find } from 'lodash';
import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import ProjectRatings, { ProjectRating } from '../entity/ProjectRatings';
import Projects, { Project } from '../entity/Projects';

class ProjectRatingController {
  public static writeValidation = [
    body('id').not().isEmpty().withMessage('Project Id is required'),
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
    projectId,
    projectIds,
    projectDetails = false,
    withRatings = true,
    ratingUser = false,
  }: {
    userId?: string;
    projectId?: string;
    projectIds?: string[];
    projectDetails?: boolean;
    withRatings?: boolean;
    ratingUser?: boolean;
  }): Promise<any> => {
    try {
      let query = ProjectRatings.find({});

      if (projectIds) {
        let filter = [];

        projectIds?.forEach((id) => {
          filter.push({
            id,
          });
        });

        query = ProjectRatings.find({ $or: [...filter] });
      } else if (userId && projectId) {
        query = ProjectRatings.find({
          id: projectId,
          'ratings.user': userId,
        });
      } else if (userId) {
        query = ProjectRatings.find({
          'ratings.user': userId,
        });
      } else if (projectId) {
        query = ProjectRatings.find({
          id: projectId,
        });
      }

      if (projectDetails) {
        query = query.populate({
          path: 'id',
          select: 'name description price img video updated creator',
          populate: { path: 'creator', select: 'name' },
        });
      }

      if (ratingUser) {
        query = query.populate({ path: 'ratings', populate: { path: 'user', select: 'name' } });
      }
      const ratings: ProjectRating[] = await query.exec();

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
    const { userId, projectId } = req.query;

    try {
      if (userId && projectId) {
        const rating: ProjectRating = await ProjectRatings.findOne({
          id: projectId,
          'ratings.user': userId,
        }).exec();

        res.status(200).json({ ratings: rating });
        return;
      }
      if (userId) {
        const ratings: ProjectRating = await ProjectRatings.findOne({
          'ratings.user': userId,
        }).exec();

        res.status(200).json({ ratings });
        return;
      }
      if (projectId) {
        const ratings: ProjectRating = await ProjectRatings.findOne({
          id: projectId,
        }).exec();

        res.status(200).json({ ratings });
        return;
      }

      const ratings: ProjectRating = await ProjectRatings.findOne({}).exec();

      res.status(200).json({ ratings });
    } catch (err) {
      next(err);
    }
  };

  public static post = {
    validate: [...ProjectRatingController.writeValidation],
    controller: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { id, rating, comment } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        next({ __src__: 'express-validator', errors });
        return;
      }

      try {
        const projectRating: ProjectRating = await ProjectRatings.findOne({ id }).exec();

        if (!projectRating) {
          const project: Project = await Projects.findOne({ _id: id }).exec();

          if (!project) {
            next({
              __src__: 'validator',
              errors: [{ param: 'id', msg: 'Invalid project id' }],
            });
            return;
          }

          const newRating = new ProjectRatings({
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

        if (find(projectRating.ratings, (obj) => obj.user.toString() === res.locals.id)) {
          next({
            __src__: 'validator',
            errors: [{ param: 'rating', msg: 'You already rated the project' }],
          });
          return;
        }

        await ProjectRatings.updateOne(
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
    validate: [...ProjectRatingController.writeValidation],
    controller: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { id, rating, comment } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        next({ __src__: 'express-validator', errors });
        return;
      }

      try {
        const projectRating: ProjectRating = await ProjectRatings.findOne({
          id,
          ratings: { $elemMatch: { user: res.locals.id } },
        }).exec();

        if (!projectRating) {
          next({
            __src__: 'validator',
            errors: [{ param: 'id', msg: 'Not rated yet to update' }],
          });
          return;
        }

        await ProjectRatings.updateOne(
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
          errors: [{ param: 'id', msg: 'Project id is required' }],
        });
        return;
      }

      const rating: ProjectRating = await ProjectRatings.findOne({
        id,
        'ratings.user': res.locals.id,
      }).exec();

      if (!rating) {
        next({
          __src__: 'validator',
          errors: [{ param: 'id', msg: 'You are not rate the project to delete the rating' }],
        });
        return;
      }

      await ProjectRatings.updateOne(
        { id },
        { $pull: { ratings: { user: res.locals.id } } }
      ).exec();

      res.status(204).json({ msg: `${res.locals.name} you delete your rating` });
    } catch (err) {
      next(err);
    }
  };
}

export default ProjectRatingController;
