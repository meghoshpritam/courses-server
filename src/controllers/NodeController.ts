import { body, validationResult } from 'express-validator';
import { Response, Request, NextFunction } from 'express';
import Nodes, { Node } from '../entity/Nodes';

class NodeController {
  public static get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.query;
    console.log('id', id);
    try {
      let query = {};
      if (id) {
        query = { ...query, _id: id };
      }

      const nodes: Node[] = await Nodes.find(query)
        .populate({ path: 'creator', select: '-refreshToken -email' })
        .populate({ path: 'exam' })
        .populate({ path: 'assignment' })
        .exec();

      res.status(200).json({ nodes });
    } catch (err) {
      next(err);
    }
  };

  public static post = {
    validate: [
      body('name').not().isEmpty().withMessage('Name is required'),
      body('description').not().isEmpty().withMessage('Description is required'),
      body('img').custom((val, { req }) => {
        if (
          (val === '' || val === undefined) &&
          (req.body.video === '' || req.body.video === undefined)
        ) {
          throw new Error('An image is required');
        }

        // pass the validation
        return true;
      }),
      body('resources').custom((val) => {
        if (val !== undefined) {
          if (val?.name !== '' && typeof val.name !== 'string') {
            throw new Error('Name of the resource is required');
          }
          if (val?.uri !== '' && typeof val.uri !== 'string') {
            throw new Error('URI of the resource is required');
          }
        }

        // pass the validation
        return true;
      }),
      body('markdown').custom((val, { req }) => {
        if (
          (val === undefined || val === '') &&
          (req.body.video === undefined || req.body.video === '') &&
          req.body.resources === undefined &&
          (req.body.exam === undefined || req.body.exam === '') &&
          (req.body.quiz === undefined || req.body.quiz === '') &&
          (req.body.assignment === '' || req.body.assignment === undefined)
        ) {
          throw new Error('A Markdown file is needed');
        }

        // pass the validation
        return true;
      }),
    ],
    controller: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const {
        name,
        description,
        img,
        video,
        markdown,
        resources,
        quiz,
        exam,
        updated,
        assignment,
      }: Node = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        next({ __src__: 'express-validator', errors });
        return;
      }

      try {
        const node: Node = new Nodes({
          name,
          description,
          img,
          video,
          markdown,
          resources,
          quiz,
          exam,
          updated,
          creator: res.locals.id,
          assignment,
        });

        node.save();

        res.status(201).end();
      } catch (err) {
        next(err);
      }
    },
  };

  public static update = {
    validate: [
      body('id').not().isEmpty().withMessage('ID is required'),
      body('name').not().isEmpty().withMessage('Name is required'),
      body('description').not().isEmpty().withMessage('Description is required'),
      body('img').custom((val, { req }) => {
        if (
          (val === '' || val === undefined) &&
          (req.body.video === '' || req.body.video === undefined)
        ) {
          throw new Error('An image is required');
        }

        // pass the validation
        return true;
      }),
      body('resources').custom((val) => {
        if (val !== undefined) {
          if (val?.name !== '' && typeof val.name !== 'string') {
            throw new Error('Name of the resource is required');
          }
          if (val?.uri !== '' && typeof val.uri !== 'string') {
            throw new Error('URI of the resource is required');
          }
        }

        // pass the validation
        return true;
      }),
      body('markdown').custom((val, { req }) => {
        if (
          (val === undefined || val === '') &&
          (req.body.video === undefined || req.body.video === '') &&
          req.body.resources === undefined &&
          (req.body.exam === undefined || req.body.exam === '') &&
          (req.body.quiz === undefined || req.body.quiz === '') &&
          (req.body.assignment === '' || req.body.assignment === undefined)
        ) {
          throw new Error('A Markdown file is needed');
        }

        // pass the validation
        return true;
      }),
    ],
    controller: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const {
        id,
        name,
        description,
        img,
        video,
        markdown,
        resources,
        quiz,
        exam,
        assignment,
      }: Node = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        next({ __src__: 'express-validator', errors });
        return;
      }

      try {
        const node: Node = await Nodes.findOne({ _id: id }).exec();
        if (node === null) {
          const error = {
            __src__: 'validator',
            errors: [{ param: 'id', msg: 'Invalid ID' }],
          };

          next(error);
          return;
        }

        if (node.creator.toString() !== res.locals.id) {
          console.log('oops!');

          res.status(401).send();
          return;
        }

        await Nodes.update(
          { _id: id },
          {
            name,
            description,
            img,
            video,
            markdown,
            resources,
            quiz,
            exam,
            updated: new Date(),
            creator: res.locals.id,
            assignment,
          }
        ).exec();

        res.status(202).end();
      } catch (err) {
        next(err);
      }
    },
  };

  public static delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.query;

    try {
      const node: Node = await Nodes.findOne({ _id: id }).exec();

      if (node === null) {
        const error = {
          __src__: 'validator',
          errors: [{ param: 'id', msg: 'Invalid ID' }],
        };

        next(error);
        return;
      }

      if (node.creator.toString() !== res.locals.id) {
        res.status(401).end();
        return;
      }

      await Nodes.deleteOne({ _id: id });

      res.status(204).end();
    } catch (err) {
      next(err);
    }
  };
}

export default NodeController;
