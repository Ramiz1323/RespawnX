import { Router } from "express";
import { register, googleCallback } from "../controllers/auth.controller.js";
import { validateRegisterUser } from "../validator/auth.validator.js";
import passport from "passport";


const router = Router();

router.post("/register", validateRegisterUser, register);

router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', { 
        session: false, 
        failureRedirect: config.NODE_ENV == "development" ? "http://localhost:3000/login" : "/login"
    }),
    googleCallback
);
export default router;