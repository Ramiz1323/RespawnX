import dotenv from "dotenv";

dotenv.config();

if (!process.env.MONGO_URI) {
  throw new Error("Please set your MONGO_URI environment variable");
}

if (!process.env.JWT_SECRET) {
  throw new Error("Please set your JWT_SECRET environment variable");
}

if(!process.env.GOOGLE_CLIENT_ID){
  throw new Error("Please set your GOOGLE_CLIENT_ID environment variable")
}

if(!process.env.GOOGLE_CLIENT_SECRET){
  throw new Error("Please set your GOOGLE_CLIENT_SECRET environment variable")
}

if(!process.env.IMAGEKIT_PRIVATE_KEY){
  throw new Error("Please set your IMAGEKIT_PRIVATE_KEY environment variable")
}

export const config = {
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  NODE_ENV: process.env.NODE_ENV || "development",
  IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
};