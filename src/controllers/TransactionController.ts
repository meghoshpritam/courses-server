import * as Razorpay from 'razorpay';
import { Request, Response, NextFunction } from 'express';
import { config } from 'dotenv';
import { sign, verify } from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { createHmac } from 'crypto';
import Goals, { Goal } from '../entity/Goals';
import Courses, { Course } from '../entity/Courses';
import Projects, { Project } from '../entity/Projects';
import secrets from '../config/config';
import MyCourseController from './MyCourseController';

config();

class TransactionController {
  public static instance = new Razorpay({
    key_id: process.env.RZP_KEY_ID,
    key_secret: process.env.RZP_KEY_SECRET,
  });

  public static createOrder = async (req: Request, res: Response, next: NextFunction) => {
    const { courseId, projectId, goalId } = req.body;

    try {
      let data: any = undefined;
      let check = false;

      if (goalId) {
        const goal: Goal = await Goals.findOne({ _id: goalId });

        try {
          check = await MyCourseController.alreadyExist({ user: res.locals.id, goalId });
        } catch (err) {
          next(err);
        }

        if (goal) {
          if (goal.price === 0) {
            try {
              await MyCourseController.add({
                user: res.locals.id,
                goal: {
                  id: goalId,
                  price: goal.price,
                  transactionId: 'free',
                  orderId: 'free',
                },
              });

              res.status(201).json({ msg: 'Goal enrolled' });
            } catch (e) {
              next(e);
            } finally {
              return;
            }
          }
          data = await TransactionController.instance.orders.create({
            amount: goal.price * 100,
            currency: 'INR',
            receipt: uuid(),
            payment_capture: 1,
            notes: {
              goal: goalId,
            },
          });
        }
      } else if (courseId) {
        const course: Course = await Courses.findOne({ _id: courseId });

        try {
          check = await MyCourseController.alreadyExist({ user: res.locals.id, courseId });
        } catch (err) {
          next(err);
        }

        if (course) {
          if (course.price === 0) {
            console.log('entered............');
            try {
              await MyCourseController.add({
                user: res.locals.id,
                course: {
                  id: courseId,
                  price: course.price,
                  transactionId: 'free',
                  orderId: 'free',
                },
              });

              res.status(201).json({ msg: 'Course enrolled' });
              console.log('oops!');
            } catch (e) {
              next(e);
            } finally {
              return;
            }
          }
          console.log('Oops!!');
          data = await TransactionController.instance.orders.create({
            amount: course.price * 100,
            currency: 'INR',
            receipt: uuid(),
            payment_capture: 1,
            notes: {
              course: courseId,
            },
          });
        }
      } else if (projectId) {
        const project: Project = await Projects.findOne({ _id: projectId });

        try {
          check = await MyCourseController.alreadyExist({ user: res.locals.id, projectId });
        } catch (err) {
          next(err);
        }

        if (project) {
          if (project.price === 0) {
            try {
              await MyCourseController.add({
                user: res.locals.id,
                project: {
                  id: projectId,
                  price: project.price,
                  transactionId: 'free',
                  orderId: 'free',
                },
              });

              res.status(201).json({ msg: 'Project enrolled' });
            } catch (e) {
              next(e);
            } finally {
              return;
            }
          }
          data = await TransactionController.instance.orders.create({
            amount: project.price * 100,
            currency: 'INR',
            receipt: uuid(),
            payment_capture: 1,
            notes: {
              project: projectId,
            },
          });
        }
      }

      const token = sign(
        {
          user: res.locals.id,
          price: data.amount,
          ...data.notes,
          orderId: data.id,
          receiptId: data.receipt,
        },
        secrets.transactionTokenSecret,
        { expiresIn: '20m' }
      );

      console.log('check res: ', check);

      // if (check) {
      //   res.status(403).json({ error: 'Already enrolled' });
      //   return;
      // }
      if (!data) {
        res.status(403).json({ error: "Can't create order" });
        return;
      }
      res.status(200).json({ token, data });
    } catch (err) {
      next(err);
    }
  };

  public static verifyOrder = async (req: Request, res: Response, next: NextFunction) => {
    const { paymentId, orderId, signature, token } = req.body;
    console.log('received:', req.body);
    try {
      const hmac = createHmac('sha256', process.env.RZP_KEY_SECRET);

      hmac.update(orderId + '|' + paymentId);

      if (hmac.digest('hex') !== signature) {
        console.log('not match signature');
        res.status(403).json({ error: 'payment failed' });
        return;
      }

      let decode: any;

      try {
        decode = verify(token, secrets.transactionTokenSecret);
        console.log('decode: ', decode);
      } catch (err) {
        console.log('verify error token: ', err);
        res.status(403).json({ error: 'Unknown payment' });
        return;
      }
      console.log('decode... ', decode);

      if (decode.user !== res.locals.id) {
        console.log('user not same');
        res.status(403).json({ error: 'Unknown payment' });
        return;
      }

      if (orderId !== decode.orderId) {
        console.log('order id not same');
        res.status(403).json({ error: 'Unknown payment' });
        return;
      }

      if (decode.course) {
        const course: Course = await Courses.findOne({ _id: decode.course });

        if (!course || decode.price !== course?.price * 100) {
          console.log('price related issue or course', course, decode.price, course.price);
          res.status(403).json({ error: 'Unknown payment' });
          return;
        }

        try {
          MyCourseController.add({
            user: decode.user,
            course: {
              id: course._id,
              price: course.price,
              transactionId: paymentId,
              orderId,
            },
          });
        } catch (err) {
          console.log('add course error', err);
          res.status(403).json({ error: 'Unknown payment' });
          return;
        }
      } else if (decode.goal) {
        const goal: Goal = await Goals.findOne({ _id: decode.course });

        if (!goal || decode.price !== goal?.price * 100) {
          console.log('goal error');
          res.status(403).json({ error: 'Unknown payment' });
          return;
        }

        try {
          MyCourseController.add({
            user: decode.user,
            goal: {
              id: goal._id,
              price: goal.price,
              transactionId: paymentId,
              orderId,
            },
          });
        } catch (err) {
          console.log('add course error', err);
          res.status(403).json({ error: 'Unknown payment' });
          return;
        }
      } else if (decode.project) {
        const project: Project = await Projects.findOne({ _id: decode.course });

        if (!project || decode.price !== project?.price * 100) {
          console.log('project error');
          res.status(403).json({ error: 'Unknown payment' });
          return;
        }

        try {
          MyCourseController.add({
            user: decode.user,
            project: {
              id: project._id,
              price: project.price,
              transactionId: paymentId,
              orderId,
            },
          });
        } catch (err) {
          console.log('add course error', err);
          res.status(403).json({ error: 'Unknown payment' });
          return;
        }
      }

      res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  };
  // TODO: verify and store on the db
  // generated_signature = hmac_sha256(razorpay_order_id + "|" + razorpay_payment_id, secret);  if (generated_signature == razorpay_signature) {    payment is successful  }
  /*
  const crypto = require("crypto");
const hmac = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET);

hmac.update(razorpayOrderId + "|" + razorpayPaymentId);
let generatedSignature = hmac.digest('hex');

let isSignatureValid = generatedSignature == payload.razorpay_signature;
// https://nodejs.org/api/crypto.html#crypto_class_hmac
   */
}

export default TransactionController;
