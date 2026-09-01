import { Router } from "express";
import multer from "multer";
import { authenticateSeller } from "../middlewares/auth.middleware";
import { createProduct, getAllProducts, getProductDetails, getSellerProducts } from "../controllers/product.controller";
import { createProductValidator } from "../validator/product.validator";

const router = Router()

const upload = multer({
    storage: multer.memoryStorage(),
    limits:{
        fileSize: 5 * 1024 * 1024,
    }
})

router.post("/", authenticateSeller, upload.array('images', 5), createProductValidator, createProduct)

router.get("/seller", authenticateSeller, getSellerProducts);

router.get("/", getAllProducts);

router.get("/details/:id", getProductDetails);

export default router