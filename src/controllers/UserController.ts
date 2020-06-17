import { Response, Request, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import * as bcrypt from 'bcryptjs';
import AuthController from './AuthController';
import Users, { User } from '../entity/Users';
import { sign, verify, decode } from 'jsonwebtoken';
import { createTestAccount, createTransport, getTestMessageUrl } from 'nodemailer';
import config from '../config/config';
class UserController {
  static get = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      const users = await Users.find({}).exec();

      let newUsers = [];
      await users.forEach((user: User) => {
        newUsers.push({
          name: user.name,
          email: user.email,
          active: user.active,
          role: user.role,
        });
      });

      res.status(200).json({ users: newUsers });
    } catch (err) {
      res.status(500);
    }
  };

  static signUp = {
    validate: [
      body('name').not().isEmpty().withMessage('Name is required'),
      body('email')
        .isEmail()
        .withMessage('Invalid email address')
        .bail()
        .normalizeEmail()
        .custom(async (value) => {
          let user: User;
          try {
            user = await Users.findOne({ email: value }).exec();
          } catch (err) {
            throw new Error('Something went wrong');
          }
          if (user !== null) throw new Error('Email is already register with us');

          // pass the validation
          return true;
        }),
    ],
    controller: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { email, name } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        next({ __src__: 'express-validator', errors });
        return;
      }

      try {
        // const hashPassword = await bcrypt.hash(password, 10);

        // const user: User = new Users({ name, email });
        // await user.save();

        const otp = (() => {
          let otp = '';
          for (let i = 0; i < 6; i++) {
            otp += Math.floor(Math.random() * 10).toString();
          }
          return otp;
        })();

        const token = sign({ name, email }, config.signUpTokenSecret + otp, {
          expiresIn: '10m',
        });

        console.log('otp: ', otp, '\ntoken: ', token);
        // let testAccount = await createTestAccount();
        // let transporter = createTransport({
        //   host: 'smtp.ethereal.email',
        //   port: 587,
        //   secure: false, // true for 465, false for other ports
        //   auth: {
        //     user: testAccount.user, // generated ethereal user
        //     pass: testAccount.pass, // generated ethereal password
        //   },
        // });
        // let info = await transporter.sendMail({
        //   from: '"Fred Foo 👻" <foo@example.com>', // sender address
        //   to: 'text@text.com', // list of receivers
        //   subject: 'Register with us :)', // Subject line
        //   text: `Your OTP is: ${otp}. Enter the OTP for register. OTP is valid for 10minutes.`, // plain text body
        // });

        // console.log('Message sent: %s', info.messageId);

        // console.log('Preview URL: %s', getTestMessageUrl(info));

        res.status(201).json({
          token,
        });
      } catch (err) {
        next(err);
      }
    },
  };

  static register = async (req: Request, res: Response, next: NextFunction) => {
    const { token, otp } = req.body;
    try {
      let tokenRes: any;
      try {
        tokenRes = verify(token, config.signUpTokenSecret + otp);
      } catch (err) {
        const error = {
          __src__: 'validator',
          errors: [{ param: 'otp', msg: 'Invalid OTP' }],
        };

        next(error);
        return;
      }

      const user: User = new Users({ name: tokenRes.name, email: tokenRes.email });
      const refreshToken = AuthController.generateRefreshToken({
        id: user._id,
        name: user.name,
        role: user.role,
      });
      const accessToken = AuthController.generateAccessToken({
        id: user._id,
        name: user.name,
        role: user.role,
      });
      user.refreshToken = refreshToken;

      console.log('user', user);
      // await user.save();

      res.status(201).json({
        name: user.name,
        role: user.role,
        accessToken,
        refreshToken,
      });
    } catch (err) {
      next(err);
    }
  };

  static signIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body;

    const error: { __src__: string; errors: { param: string; msg: string }[] } = {
      __src__: 'validator',
      errors: [],
    };

    try {
      const user: User = await Users.findOne({ email });

      if (user === null) {
        error.errors = [{ param: 'email', msg: 'Email id is not register with us!' }];
        next(error);
        return;
      }
      if (!user.active) {
        error.errors = [{ param: 'email', msg: 'Account is not active' }];
        next(error);
        return;
      }

      if (!bcrypt.compare(password, user.password)) {
        error.errors = [{ param: 'password', msg: 'Wrong password' }];
        next(error);
        return;
      }

      let refreshToken: string;
      if (!(!!user.refreshToken && !!AuthController.verifyRefreshToken(user.refreshToken))) {
        refreshToken = AuthController.generateRefreshToken({
          id: user._id,
          name: user.name,
          role: user.role,
        });

        await Users.update({ email }, { refreshToken }).exec();
      }
      const accessToken = AuthController.generateAccessToken({
        id: user._id,
        name: user.name,
        role: user.role,
      });

      res.status(200).json({
        name: user.name,
        _id: user._id,
        role: user.role,
        active: user.active,
        refreshToken,
        accessToken,
      });
    } catch (err) {
      next(err);
    }
  };

  static toggleActive = {
    validate: [
      body('email')
        .isEmail()
        .withMessage('Invalid email address')
        .bail()
        .normalizeEmail()
        .custom(async (value) => {
          let user: User;
          try {
            user = await Users.findOne({ email: value }).exec();
          } catch (err) {
            throw new Error('Something went wrong');
          }
          if (user === null) throw new Error('Email is not register with us');

          // pass the validation
          return true;
        }),
    ],
    controller: async (req: Request, res: Response, next: NextFunction) => {
      const { active, email } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        next({ __src__: 'express-validator', errors });
        return;
      }

      try {
        await Users.update({ email }, { active }).exec();

        res
          .status(200)
          .json({ msg: `User account ${active ? 'activate' : 'deactivate'} successfully` });
      } catch (err) {
        next(err);
      }
    },
  };

  // static update = {
  //   validate: [],
  //   controller: async (req: Request, res: Response, next: NextFunction) => {
  //     const {name, email, id} = req.body;

  //     const errors = validationResult(req);
  //     if (!errors.isEmpty()) {
  //       next({ __src__: 'express-validator', errors });
  //       return;
  //     }

  //     try {
  //     } catch (err) {
  //       next(err);
  //     }
  //   },
  // };
}

export default UserController;
