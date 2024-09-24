import { prismaClient } from "../application/database.js";
import jwt from "jsonwebtoken";

export const refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        errors: "Unauthorized",
      });
    }
    const user = await prismaClient.user.findFirst({
      where: {
        token: refreshToken,
      },
    });
    if (!user) {
      return res.status(404).json({
        errors: "Error Forbidden",
      });
    }
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err) {
          return res.status(403).json({
            errors: "Halo Forbidden",
          });
        }
        const id = user.id;
        const email = user.email;
        const password = user.password;
        const accessToken = jwt.sign(
          { id, email, password },
          process.env.ACCESS_TOKEN_SECRET,
          {
            expiresIn: "1d",
          }
        );
        res.json({ accessToken });
      }
    );
  } catch (e) {
    return next(e);
  }
};
