import express from 'express'
import {register,login,logout, sendVerificationOtp,verifyEmail, isAuthenticated} from '../controllers/auth.controller.js'
import userAuth from '../middleware/userAuth.js';

const authRoouter= express.Router();

authRoouter.post('/register',register);
authRoouter.post('/login',login);
authRoouter.post('/logout',logout);
authRoouter.post('/send-verify-otp',userAuth,sendVerificationOtp);
authRoouter.post('/verify-account',userAuth,verifyEmail);
authRoouter.post('/is-auth',userAuth,isAuthenticated);

export default authRoouter;
