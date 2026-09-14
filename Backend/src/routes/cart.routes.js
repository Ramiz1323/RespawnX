import express from "express";
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { addToCart, getCart } from '../controllers/cart.controller.js'
import { validateAddToCart } from "../validator/cart.validator.js";

const router = express.Router();

router.use(authenticateUser);

/**
 * @route POST /api/cart/add/:productId/:variantId
 * @description Add a product to the cart
 * @access Private
 * @argument productId - ID of the product to be added to the cart
 * @argument variantId - ID of the variant of the product to be added to the cart
 * @argument quantity - Quantity of the product to be added to the cart
 */
router.post('/add/:productId/:variantId', validateAddToCart, addToCart);

/**
 * @route GET /api/cart/
 * @description Get the cart
 * @access Private
 */
router.get('/', getCart);

export default router;