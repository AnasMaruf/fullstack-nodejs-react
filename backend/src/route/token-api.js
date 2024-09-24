import express from "express";

// import { refreshToken } from "../controller/refresh-token-controller.js";
import userController from "../controller/user-controller.js";
import { refreshToken } from "../controller/Refresh-Token-Controller.js";

const tokenRouter = express.Router();

// Token API
tokenRouter.get("/api/token", refreshToken);

// User API
tokenRouter.delete("/api/users/logout", userController.logout);
export { tokenRouter };
