import express from 'express'
import {getUserData} from "../controllers/user.controller.js"
import userAuth from '../middleware/userAuth.js';
const userRoutes= express.Router();

userRoutes.get('/data',userAuth,getUserData);

export default userRoutes;