import dotenv from "dotenv";

dotenv.config();

if (!process.env.MONGO_URI) {
  throw new Error("Please set your MONGO_URI environment variable");
}

export const config = {
  MONGO_URI: process.env.MONGO_URI,
//   JWT_SECRET: process.env.JWT_SECRET,
};