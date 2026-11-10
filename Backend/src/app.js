import cookieParser from "cookie-parser";
import express from "express";
import authRouter from "./routes/auth.routes.js";
import productRouter from "./routes/product.routes.js";
import cartRouter from "./routes/cart.routes.js";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { config } from "./config/config.js";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

passport.use(new GoogleStrategy({
  clientID: config.GOOGLE_CLIENT_ID,
  clientSecret: config.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback"
},(accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}
))

app.use(cors());

const cors = {
  origin: "http://localhost:5173" || config.FRONTEND_URL, 
  credentials: true, 
}

//Routes
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to RespawnX Backend",
  });
});

app.use("/api/auth", authRouter)
app.use("/api/products", productRouter)
app.use("/api/cart", cartRouter);

export default app;