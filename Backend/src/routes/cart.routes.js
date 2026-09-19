import express from "express";
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { addToCart, getCart, incrementCartItemQuantity, decrementCartItemQuantity } from '../controllers/cart.controller.js'
import { validateAddToCart, validateIncrementCartItemQuantity, validateDecrementCartItemQuantity } from "../validator/cart.validator.js";

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
 * @route POST /api/cart/quantity/increment/:productId/:variantId
 * @description Increment the quantity of a product in the cart
 * @access Private
 * @argument productId - ID of the product to be incremented in the cart
 * @argument variantId - ID of the variant of the product to be incremented in the cart
 */
router.post('/quantity/increment/:productId/:variantId', validateIncrementCartItemQuantity, incrementCartItemQuantity);

/**
 * @route POST /api/cart/quantity/decrement/:productId/:variantId
 * @description Decrement the quantity of a product in the cart
 * @access Private
 * @argument productId - ID of the product to be decremented in the cart
 * @argument variantId - ID of the variant of the product to be decremented in the cart
 */
router.post('/quantity/decrement/:productId/:variantId', validateDecrementCartItemQuantity, decrementCartItemQuantity);

export default router;