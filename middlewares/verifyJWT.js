import User from "../models/userModel.js";
import { verifyToken } from "../utils/token.js";

const verifyJWT = async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (authorization === undefined) {
      return next({ status: 401, message: "Unauthorized user access." });
    }

    const token = authorization.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (decoded === null) {
      return next({ status: 401, message: "Unauthorized user access." });
    }

    const user = await User.findById(decoded._id);

    if (user && user.isVerified) {
      req.decoded = decoded;
      return next();
    }

    next({ status: 401, message: "Unauthorized user access." });
  } catch (err) {
    next({ message: "User authorization failed." });
  }
};

export default verifyJWT;
