import productModel from "../models/product.model.js";
import cartModel from "../models/cart.model.js";
import { stockOfVariant } from "../dao/product.dao.js";

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

    if(quantity > stock) {
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