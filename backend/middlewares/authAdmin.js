import jwt from "jsonwebtoken";

// admin authentication middleware
const authAdmin = async (req, res, next) => {
  try {
    const { atoken } = req.headers;
    if (!atoken) {
      return res.json({
        success: false,
        msg: " authorization denied",
      });
    }
    const token_decord = jwt.verify(atoken, process.env.JWT_Secret);

    if (token_decord !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
      return res.json({
        success: false,
        msg: " authorization denied",
      });
    }
    next();
  } catch (error) {
    console.log(error);
    res.json({ success: false, meassage: error.meassage });
  }
};

export default authAdmin;
