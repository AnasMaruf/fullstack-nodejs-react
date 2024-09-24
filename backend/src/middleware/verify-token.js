import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const refreshToken = req.cookies.refreshToken;
  if (token == null || !refreshToken) {
    return res.sendStatus(401);
  } else {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({
          errors: "Error Forbidden",
        });
      } else {
        req.user = decoded;
        next();
      }
    });
  }
};
