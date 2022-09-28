const jwt = require("jsonwebtoken");
const config = require("../config/config");

const verifyToken = async (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["authorization"];

  if (!token) {
    res
      .status(200)
      .send({ success: false, msg: "A token is required for authentication" });
  }
  try {
    const descode = jwt.verify(token, config.secret_jwt);
    req.user = descode;
  } catch (error) {
    res.status(400).send("Invalid Token");
  }
  return next();
};
module.exports = verifyToken;
