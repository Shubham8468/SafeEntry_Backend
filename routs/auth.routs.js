import express from 'express'
import {register,login,logout} from '../controllers/auth.controller.js'

const authRoouter= express.Router();

authRoouter.post('/register',register);
authRoouter.post('/login',login);
authRoouter.post('/logout',logout);

export default authRoouter;
