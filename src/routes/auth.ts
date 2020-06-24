/*
 * Authentication routes
 */

import { Router } from 'express';
import UserController from '../controllers/UserController';
import * as rateLimit from 'express-rate-limit';

const routes: Router = Router();

// limit for sign in
const apiLimiterSignIn = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many try to sign in request after 1 hour',
});

// sign in
routes.post('/sign-in', apiLimiterSignIn, UserController.signIn);

// limit for sign in verification
const apiLimiterSignInVerification = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  message: 'Too many try try again 10 minute latter',
});

// sign in verify generateOtp
routes.post('/sign-in-otp-verify', apiLimiterSignInVerification, UserController.signInOTPVerify);

// limit for sign up
const apiLimiterSignUp = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many try to sign in request after 1 hour',
});

// sign up
routes.post(
  '/sign-up',
  apiLimiterSignUp,
  UserController.signUp.validate,
  UserController.signUp.controller
);

// limit for sign up verification
const apiLimiterSignUpVerification = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many try to sign in request after 1 hour',
});

// sign up verify otp
routes.post('/sign-up-otp-verify', apiLimiterSignUpVerification, UserController.signUpOTPVerify);

// sign out
routes.post('/sign-out', UserController.signOut);

// sign out all
routes.post('/sign-out-all', UserController.signOutAll);

// sign out all otp verification
routes.post('/sign-out-all-otp-verify', UserController.signOutAllOtpVerification);

// generate access token
routes.post('/generate-access-token', UserController.generateAccessToken);

export default routes;
