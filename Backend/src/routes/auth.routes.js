import { Router } from "express";
import { register, googleCallback } from "../controllers/auth.controller.js";
import { validateRegisterUser } from "../validator/auth.validator.js";
import passport from "passport";


const router = Router();

router.post("/register", validateRegisterUser, register);

router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', { session: false }),
    googleCallback
);
export default router;