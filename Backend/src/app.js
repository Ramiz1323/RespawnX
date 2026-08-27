import cookieParser from "cookie-parser";
import express from "express";
import authRouter from "./routes/auth.routes.js";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}))

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to RespawnX Backend",
  });
});


app.use("/api/auth", authRouter)

export default app;