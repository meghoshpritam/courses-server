import { body, validationResult } from 'express-validator';
import { Response, Request, NextFunction } from 'express';
import Nodes, { Node } from '../entity/Nodes';

class NodeController {
  public static writeValidation = [
    body('name').not().isEmpty().withMessage('Name is required'),
    body('description').not().isEmpty().withMessage('Description is required'),
    body('img').custom((val, { req }) => {
      if ((val === '' || !val) && (req.body.video === '' || !req.body.video)) {
        throw new Error('An image is required');
      }

      // pass the validation
      return true;
    }),
    body('resources').custom((val) => {
      if (val !== undefined) {
        val?.forEach((resource) => {
          if (!resource.name || resource?.name === '') {
            throw new Error('Name of the resource is required');
          }
          if (!resource.uri || resource?.uri === '') {
            throw new Error('URI of the resource is required');
          }
        });
      }

      // pass the validation
      return true;
    }),
    body('markdown').custom((val, { req }) => {
      if (
        (!val || val === '') &&
        (!req.body.video || req.body.video === '') &&
        !req.body.resources &&
        (!req.body.exam || req.body.exam === '') &&
        (!req.body.quiz || req.body.quiz === '') &&
        (req.body.assignment === '' || !req.body.assignment)
      ) {
        throw new Error('A Markdown file is needed');
      }

      // pass the validation
      return true;
    }),
  ];

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
    validate: [...NodeController.writeValidation],
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
        assignment,
      }: Node = req.body;

      console.log('props: ', req.body);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        next({ __src__: 'express-validator', errors });
        return;
      }

      try {
        const node: Node = new Nodes({
          name,
          description,
          img: img === '' ? undefined : img,
          video: video === '' ? undefined : video,
          markdown: markdown === '' ? undefined : markdown,
          resources: !resources ? [] : resources,
          quiz: quiz === '' ? undefined : quiz,
          exam: exam === '' ? undefined : exam,
          updated: new Date(),
          creator: res.locals.id,
          assignment: assignment === '' ? undefined : assignment,
        });

        node.save();

        res.status(201).json({ msg: 'Node added successfully' });
      } catch (err) {
        next(err);
      }
    },
  };

  public static update = {
    validate: [
      ...NodeController.writeValidation,
      body('id').not().isEmpty().withMessage('ID is required'),
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
            resources: resources || [],
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
