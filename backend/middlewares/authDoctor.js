import jwt from "jsonwebtoken";

// doctor auth
const authDoctor = async (req, res, next) => {
  try {
    const { dtoken } = req.headers;
    if (!dtoken) {
      return res.json({
        success: false,
        message: "Not Authorized Login Again",
      });
    }
    const token_decode = jwt.verify(dtoken, process.env.JWT_Secret);

    // Initialize req.body if it's undefined
    req.body = req.body || {};
    req.body.docId = token_decode.id;

    next();
  } catch (error) {
    console.log(error);
    return res.json({ success: false, error: error.message });
  }
};

export default authDoctor;
