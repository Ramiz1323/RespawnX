import express from "express";
import {authenticateUser} from '../middlewares/auth.middleware.js';
import {getCart} from '../controllers/cart.controller.js'

const router = express.Router();

router.use(authenticateUser);

router.get('/', getCart);



export default router;