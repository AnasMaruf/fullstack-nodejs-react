import express from "express";
import userController from "../controller/user-controller.js";
import { refreshToken } from "../controller/Refresh-Token-Controller.js";
// import { refreshToken } from "../controller/refresh-token-controller.js";

const publicRouter = new express.Router();

publicRouter.get("/refresh", refreshToken);

publicRouter.post("/api/users", userController.register);
publicRouter.post("/api/users/login", userController.login);

export { publicRouter };
