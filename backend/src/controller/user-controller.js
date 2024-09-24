import { prismaClient } from "../application/database.js";
import userService from "../service/user-service.js";
import jwt from "jsonwebtoken";

const register = async (req, res, next) => {
  try {
    const result = await userService.register(req.body);
    res.status(200).json({
      data: result,
    });
  } catch (e) {
    next(e);
  }
};

const login = async (req, res, next) => {
  try {
    const request = req.body;
    const id = request.id;
    const email = request.email;
    const password = request.password;
    const accessToken = jwt.sign(
      { id, email, password },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      }
    );
    const refreshToken = jwt.sign(
      { id, email, password },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );
    await userService.login(request, refreshToken);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      token: accessToken,
    });
    //res.json({ accessToken });
  } catch (e) {
    next(e);
  }
};

const get = async (req, res, next) => {
  try {
    const result = await userService.get(req.user.id);
    res.status(200).json({
      data: result,
    });
  } catch (e) {
    next(e);
  }
};

const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      res.sendStatus(204);
      return;
    }
    const user = await prismaClient.user.findFirst({
      where: {
        token: refreshToken,
      },
    });
    if (!user) {
      res.sendStatus(204);
      return;
    }
    await userService.logout(user.id);
    res.clearCookie("refreshToken");
    res.status(200).json({
      data: "OK",
    });
  } catch (e) {
    return next(e);
  }
};

export default { register, login, get, logout };
