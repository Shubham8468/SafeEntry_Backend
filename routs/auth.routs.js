import express from 'express'
import {register,login,logout, sendVerificationOtp,verifyEmail, isAuthenticated,sendResetOtp,resetPassword} from '../controllers/auth.controller.js'
import userAuth from '../middleware/userAuth.js';

const authRoouter= express.Router();

authRoouter.post('/register',register);
authRoouter.post('/login',login);
authRoouter.post('/logout',logout);
authRoouter.post('/send-verify-otp',userAuth,sendVerificationOtp);
authRoouter.post('/verify-account',userAuth,verifyEmail);
authRoouter.get('/is-auth',userAuth,isAuthenticated);
authRoouter.post('/sent-reset-otp',sendResetOtp);
authRoouter.post('/reset-password',resetPassword);

export default authRoouter;
