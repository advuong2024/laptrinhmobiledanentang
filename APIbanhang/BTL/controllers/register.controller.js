const { logToFile } = require("../services/logger"); // đường dẫn tùy bạn
const User_account = require("../models/user_account.model");
const Customer = require("../models/customer.model");

exports.register = (req, res) => {
  logToFile("📩 Dữ liệu nhận từ frontend: " + JSON.stringify(req.body));

  const { username, password, fullname, gender, phone, email, address } = req.body;

  if (!username || !password || !fullname || !gender) {
    logToFile("⚠️ Thiếu dữ liệu đầu vào");
    return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
  }

  const customer = {
    fullname,
    gender,
    phone,
    email,
    address: address || null,
    avatar: null,
  };

  logToFile("📦 Dữ liệu chèn vào customer: " + JSON.stringify(customer));

  Customer.insert(customer, (err, cusRes) => {
    if (err) {
      logToFile("❌ Lỗi khi thêm customer: " + (err.sqlMessage || err.message));
      return res.status(500).json({ message: "Lỗi server khi tạo khách hàng" });
    }

    logToFile("✅ Customer thêm thành công: " + JSON.stringify(cusRes));

    const user_account = {
      username,
      password,
      role: "customer",
      customer_id: cusRes.customer_id,
    };

    logToFile("📦 Dữ liệu chèn vào user_account: " + JSON.stringify(user_account));

    User_account.insert(user_account, (err, userRes) => {
      if (err) {
        logToFile("❌ Lỗi khi thêm user_account: " + (err.sqlMessage || err.message));
        return res.status(500).json({ message: "Lỗi server khi tạo tài khoản" });
      }

      logToFile("✅ User_account thêm thành công: " + JSON.stringify(userRes));

      res.status(201).json({
        message: "Đăng ký thành công",
        customer: cusRes,
        account: userRes,
      });
    });
  });
};
