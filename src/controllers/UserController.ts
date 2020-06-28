import { generateOtp } from './../functions/auth';
import { Response, Request, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
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

  /*
   * Register with the server, check email is already register or not, if not then generate
   * otp and send it to email and the token is send to the client
   */
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

        const otp = generateOtp();

        const token = sign({ name, email }, config.signUpTokenSecret + otp, {
          expiresIn: '10m',
        });

        console.log('otp: ', otp, '\ntoken: ', token);
        const transporter = createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_ID,
            pass: process.env.PASSWORD,
          },
        });
        let info = await transporter.sendMail({
          from: process.env.EMAIL_ID,
          to: email,
          subject: 'Register with us :)',
          text: `Welcome ${name}, Your OTP is: ${otp}. Enter the OTP for register. OTP is valid for 10 minutes.`,
        });

        res.status(201).json({
          token,
        });
      } catch (err) {
        next(err);
      }
    },
  };

  /*
   * take the otp and the token and verify the token with otp if valid then return the access token
   * and the refresh token and save the refresh token to db
   */
  static signUpOTPVerify = async (req: Request, res: Response, next: NextFunction) => {
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
        index: 0,
      });
      const accessToken = AuthController.generateAccessToken({
        id: user._id,
        name: user.name,
        role: user.role,
      });
      user.refreshToken[0] = refreshToken;

      console.log('user', user);
      await user.save();

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

  /*
   * Sign in with email and check is email exist and account is active or not, is active send the
   * otp to the email and token to the clint
   */
  // TODO: If old refresh token is exist then create a new one and save it to db and also update the old refresh token whenever ask for new access token maximum 3 signIn possible
  static signIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email } = req.body;

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
        error.errors = [{ param: 'email', msg: `Account is inactive, ${user.inactiveMsg}` }];
        next(error);
        return;
      }

      let nullIdx = -1;
      if (user.refreshToken.length > 2) {
        for (let idx = 0; idx < user.refreshToken.length; idx++) {
          if (user.refreshToken[idx] === null) {
            nullIdx = idx;
            break;
          }
        }
        if (nullIdx === -1) {
          error.errors = [
            { param: 'email', msg: `You can access your account from maximum 3 device!` },
          ];
          next(error);
          return;
        }
      }

      const otp = generateOtp();

      const token = sign(
        { email, index: nullIdx !== -1 ? nullIdx : user.refreshToken.length },
        config.otpVerificationTokenSecret + otp,
        {
          expiresIn: '10m',
        }
      );

      console.log('otp: ', otp, '\ntoken: ', token);
      const transporter = createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_ID,
          pass: process.env.PASSWORD,
        },
      });
      let info = await transporter.sendMail({
        from: process.env.EMAIL_ID,
        to: email,
        subject: 'Sign In with your account',
        text: `Your OTP is: ${otp}. Enter the OTP for register. OTP is valid for 10 minutes.`,
      });

      res.status(200).json({
        token,
      });
    } catch (err) {
      next(err);
    }
  };

  /*
   * verify the otp and the token to sign in and return the access token and refresh token to the user
   */
  static signInOTPVerify = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { token, otp } = req.body;
    try {
      let tokenRes: any;
      try {
        tokenRes = verify(token, config.otpVerificationTokenSecret + otp);
      } catch (err) {
        const error = {
          __src__: 'validator',
          errors: [{ param: 'otp', msg: 'Invalid OTP' }],
        };

        next(error);
        return;
      }

      const user: User = await Users.findOne({ email: tokenRes.email });

      let refreshToken = AuthController.generateRefreshToken({
        id: user._id,
        name: user.name,
        role: user.role,
        index: tokenRes.index,
      });

      user.refreshToken[tokenRes.index] = refreshToken;
      console.log('let test', user.refreshToken);

      await Users.update(
        { email: tokenRes.email },
        { refreshToken: [...user.refreshToken.slice(0, 3)] }
      ).exec();

      const accessToken = AuthController.generateAccessToken({
        id: user._id,
        name: user.name,
        role: user.role,
      });

      res.status(201).json({
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

  // TODO: Implement sign out functionality instantly
  /*
   * Sign out from device
   */
  static signOut = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { refreshToken } = req.body;

    try {
      const decode: any = AuthController.verifyRefreshToken(refreshToken);

      if (!decode) {
        const error = {
          __src__: 'validator',
          errors: [{ param: 'refreshToken', msg: 'Invalid refresh token' }],
        };

        next(error);
        return;
      }

      const user: User = await Users.findOne({ _id: decode.id }).exec();

      if (user.refreshToken.indexOf(refreshToken) === -1) {
        const error = {
          __src__: 'validator',
          errors: [{ param: 'refreshToken', msg: 'Invalid refresh token' }],
        };

        next(error);
        return;
      }

      await Users.update(
        { _id: decode.id },
        {
          refreshToken: [
            ...user.refreshToken.map((token) => (token === refreshToken ? null : token)),
          ],
        }
      ).exec();

      res.status(200).json({ msg: 'successfully sign out without 25 hour' });
    } catch (err) {
      next(err);
    }
  };

  /*
   * Sign out all
   */
  static signOutAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email } = req.body;

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
        error.errors = [{ param: 'email', msg: `Account is inactive, ${user.inactiveMsg}` }];
        next(error);
        return;
      }

      const otp = generateOtp();

      const token = sign({ email, id: user._id }, config.signOutAllTokenSecret + otp, {
        expiresIn: '5m',
      });

      console.log('otp: ', otp, '\ntoken: ', token);
      const transporter = createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_ID,
          pass: process.env.PASSWORD,
        },
      });
      let info = await transporter.sendMail({
        from: process.env.EMAIL_ID,
        to: email,
        subject: 'Sign Out from All Device',
        text: `Your OTP is: ${otp}. Enter the OTP for register. OTP is valid for 5 minutes.`,
      });

      res.status(201).json({
        token,
      });
    } catch (err) {
      next(err);
    }
  };

  /*
   * Sign out all otp verification
   */
  static signOutAllOtpVerification = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { token, otp } = req.body;
    try {
      let tokenRes: any;
      try {
        tokenRes = verify(token, config.signOutAllTokenSecret + otp);
      } catch (err) {
        const error = {
          __src__: 'validator',
          errors: [{ param: 'otp', msg: 'Invalid OTP' }],
        };

        next(error);
        return;
      }

      await Users.update({ _id: tokenRes.id }, { refreshToken: [] }).exec();

      res.status(200).json({
        msg: 'Successfully sign out from all device within 25 hour',
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
  static generateAccessToken = async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;

    try {
      const decode: any = AuthController.verifyRefreshToken(refreshToken);

      if (!decode) {
        console.log('decodeeee');

        res.status(401).end();
        return;
      }

      console.log('decode ', decode);

      const user: User = await Users.findOne({ _id: decode.id });

      if (!user) {
        res.status(401).end();
        return;
      }

      if (refreshToken !== user.refreshToken[decode.index]) {
        res.status(401).end();
        return;
      }

      const accessToken = AuthController.generateAccessToken({
        id: user._id,
        name: user.name,
        role: user.role,
      });

      res.status(200).json({ accessToken });
    } catch (err) {
      next(err);
    }
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
