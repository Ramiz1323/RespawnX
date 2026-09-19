import express from "express";
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { addToCart, getCart, incrementCartItemQuantity } from '../controllers/cart.controller.js'
import { validateAddToCart, validateIncrementCartItemQuantity } from "../validator/cart.validator.js";

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

/**
 * @route POST /api/cart/increment/:productId/:variantId
 * @description Increment the quantity of a product in the cart
 * @access Private
 * @argument productId - ID of the product to be incremented in the cart
 * @argument variantId - ID of the variant of the product to be incremented in the cart
 */
router.post('/quantity/increment/:productId/:variantId', validateIncrementCartItemQuantity, incrementCartItemQuantity);

export default router;