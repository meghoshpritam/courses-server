/*
 * Authentication routes
 */

import { Router } from 'express';
import UserController from '../controllers/UserController';

const routes: Router = Router();

// sign in
routes.post('/sign-in', UserController.signIn);

// sign in verify generateOtp
routes.post('/sign-in-otp-verify', UserController.signInOTPVerify);

// sign up
routes.post('/sign-up', UserController.signUp.validate, UserController.signUp.controller);

// sign up verify otp
routes.post('/sign-up-otp-verify', UserController.signUpOTPVerify);

export default routes;
