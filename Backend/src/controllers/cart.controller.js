import productModel from "../models/product.model.js";
import cartModel from "../models/cart.model.js";
import { stockOfVariant } from "../dao/product.dao.js";
import { getCartDetails } from "../dao/cart.dao.js";
import { createOrder } from "../services/payment.service.js";
import paymentModel from "../models/payment.model.js";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils.js";

export const addToCart = async (req, res) => {
    const { productId, variantId } = req.params;
    const { quantity } = req.body;

    const product = await productModel.findOne({
        _id: productId,
        "variants._id": variantId,
    });

    if (!product) {
        return res.status(404).json({
            success: false,
            message: "Product not found"
        });
    }

    const stock = await stockOfVariant(productId, variantId);

    const cart = (await cartModel.findOne({ user: req.user._id })) || (await cartModel.create({ user: req.user._id }));

    const isProductAlreadyInCart = cart.items.some(item => item.product.toString() === productId && item.variant?.toString() === variantId);

    if (isProductAlreadyInCart) {
        const quantityInCart = cart.items.find(item => item.product.toString() === productId && item.variant?.toString() === variantId).quantity;
        if (quantity + quantityInCart > stock) {
            return res.status(400).json({
                success: false,
                message: `Only ${stock - quantityInCart} items left in stock`
            });
        }

        await cartModel.findOneAndUpdate(
            { user: req.user._id, "items.product": productId, "items.variant": variantId },
            { $inc: { "items.$.quantity": quantity } },
            { new: true }
        )

        return res.status(200).json({
            success: true,
            message: "Item added to cart"
        });
    }

    if (quantity > stock) {
        return res.status(400).json({
            success: false,
            message: `Only ${stock} items left in stock`
        });
    }

    const variant = product.variants.find(variant => variant._id.toString() === variantId);

    const item = {
        product: productId,
        variant: variantId,
        quantity,
        price: {
            amount: variant.price.amount,
            currency: variant.price.currency
        }
    }

    cart.items.push(item);
    await cart.save();

    return res.status(200).json({
        success: true,
        message: "Item added to cart"
    });
}

export const getCart = async (req, res) => {
    const user = req.user;

    let cart = await getCartDetails(user._id);

    if (!cart) {
        cart = await cartModel.create({ user: user._id });
    }

    return res.status(200).json({
        success: true,
        message: "Cart fetched successfully",
        cart
    });
}

export const createOrderController = async(req, res) => {
    const cart = await getCartDetails(req.user._id)

    if(!cart){
        return res.status(400).json({
            message: "Cart is empty",
            success: false
        })
    }

    const order = await createOrder({ amount: cart.totalPrice, currency: cart.currency })

    const payment = await paymentModel.create({
        user: req.user._id,
        razorpay: {
            orderId: order.id
        },
        price: {
            amount: cart.totalPrice,
            currency: cart.currency
        },
        orderItems: cart.items.map(item => ({
            title: item.product.title,
            productId: item.product._id,
            variantId: item.variant._id,
            quantity: item.quantity,
            images: item.product.variants.images || item.product.images,
            description: item.product.description,
            price: {
                amount: item.product.variants.price.amount || item.product.price.amount,
                currency: item.product.variants.price.currency || item.product.price.currency
            }
        }))
    })

    return res.status(200).json({
        message: "Order created successfully",
        success: true,
        order
    })
}

export const verifyOrderController = async (req,res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const payment = await paymentModel.findOneAndUpdate({ 
        'razorpay.orderId': razorpay_order_id,
        status: "pending"  
    })

    if(!payment){
        return res.status(400).json({
            message: "Payment not found",
            success: false
        })
    }

    const isPaymentValid = validatePaymentVerification({
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id
    }, razorpay_signature, config.RAZORPAY_KEY_SECRET)

    if(!isPaymentValid){
        payment.status = "failed"
        await payment.save();

        return res.status(400).json({
            message: "Payment verification failed",
            success: false
        })
    }

    payment.status = "paid"
    payment.razorpay.paymentId = razorpay_payment_id;
    payment.razorpay.signature = razorpay_signature;

    await payment.save();

    return res.status(200).json({
        message: "Payment verified successfully",
        success: true
    })
}

export const incrementCartItemQuantity = async (req, res) => {
    const { productId, variantId } = req.params;

    const product = await productModel.findOne({
        _id: productId,
        "variants._id": variantId
    })

    if (!product) {
        return res.status(404).json({
            message: "Product or variant not found",
            success: false
        })
    }


    const cart = await cartModel.findOne({ user: req.user._id });

    if (!cart) {
        return res.status(404).json({
            message: "Cart not found",
            success: false
        })
    }

    const stock = stockOfVariant(productId, variantId);

    const itemQuantityInCart = cart.items.find(item => item.product.toString() === productId && item.variant?.toString() === variantId)?.quantity || 0;

    if (itemQuantityInCart + 1 > stock) {
        return res.status(400).json({
            message: `Only ${stock} items left in stock and you already have ${itemQuantityInCart} items in your cart.`,
            success: false
        });
    }

    await cartModel.findOneAndUpdate(
        { user: req.user._id, "items.product": productId, "items.variant": variantId },
        { $inc: { "items.$.quantity": 1 } },
        { new: true }
    );

    const updatedCart = await cartModel.findOne({ user: req.user._id }).populate("items.product");

    return res.status(200).json({
        success: true,
        message: "Item quantity incremented successfully",
        cart: updatedCart
    });
}

export const decrementCartItemQuantity = async (req, res) => {
    const { productId, variantId } = req.params;

    const product = await productModel.findOne({
        _id: productId,
        "variants._id": variantId
    });

    if (!product) {
        return res.status(404).json({
            message: "Product or variant not found",
            success: false
        });
    }

    const cart = await cartModel.findOne({ user: req.user._id });

    if (!cart) {
        return res.status(404).json({
            message: "Cart not found",
            success: false
        });
    }

    const itemInCart = cart.items.find(
        item => item.product.toString() === productId && item.variant?.toString() === variantId
    );

    if (!itemInCart) {
        return res.status(404).json({
            message: "Item not found in cart",
            success: false
        });
    }

    if (itemInCart.quantity <= 1) {
        await cartModel.findOneAndUpdate(
            { user: req.user._id },
            { $pull: { items: { product: productId, variant: variantId } } },
            { new: true }
        );
    } else {
        await cartModel.findOneAndUpdate(
            { user: req.user._id, "items.product": productId, "items.variant": variantId },
            { $inc: { "items.$.quantity": -1 } },
            { new: true }
        );
    }

    const updatedCart = await cartModel.findOne({ user: req.user._id }).populate("items.product");

    return res.status(200).json({
        success: true,
        message: "Item quantity decremented successfully",
        cart: updatedCart
    });
};