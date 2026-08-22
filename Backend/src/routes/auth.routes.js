import { Router } from "express";
import { register } from "../controllers/auth.controller.js";
import { validateRegisterUser } from "../validator/auth.validator.js";

const router = Router();

router.post("/register",validateRegisterUser, register);

export default router;