const jwt = require("jsonwebtoken");

const authenticateOptionalToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return next(); // guest → tiếp tục

  const token = authHeader.split(' ')[1];
  if (!token) return next(); // guest → tiếp tục

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (!err) req.user = user; // gắn user nếu token hợp lệ
    next(); // token hết hạn hoặc sai → xem như guest
  });
};

module.exports = authenticateOptionalToken;
