import Razorpay from "razorpay";
import crypto from "crypto";
import { config } from "../config/config.js";

const razorpay = new Razorpay({
    key_id: config.RAZORPAY_KEY_ID,
    key_secret: config.RAZORPAY_KEY_SECRET
});

export const createOrder = async ({ amount, currency = "INR" }) => {
    const options = {
        amount: Math.round(amount * 100),
        currency
    };

    const order = await razorpay.orders.create(options);

    return order;
};

export const verifyPayment = ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
    const expectedSignature = crypto
        .createHmac("sha256", config.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

    return expectedSignature === razorpay_signature;
};