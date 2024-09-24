import express from "express";
import { publicRouter } from "../route/public-api.js";
import { errorMiddleware } from "../middleware/error-middleware.js";
import cors from "cors";
import { userRouter } from "../route/api.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { tokenRouter } from "../route/token-api.js";

dotenv.config();
export const web = express();
web.use(cors({ credentials: true, origin: "http://localhost:5173" }));
web.use(cookieParser());
web.use(express.json());
web.use(express.static("public"));
web.use(tokenRouter);
web.use(publicRouter);
web.use(userRouter);
web.use(errorMiddleware);
