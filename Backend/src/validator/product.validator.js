import { validationResult } from "express-validator";

function validateRequest(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Validation Error", errors: errors.array() });
    }

    next();
}

export const createProductValidator = [
    body("title").isString().withMessage("Title is required"),
    body("description").isString().withMessage("Description is required"),
    body("priceAmount").isNumeric().withMessage("Price amount is required"),
    body("priceCurrency").isString().withMessage("Price currency is required"),
    validateRequest
]