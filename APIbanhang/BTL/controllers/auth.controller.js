const db = require("../common/db");
const user_account = require("../models/user_account.model");
const CartModel = require("../models/cart.model");
const jwt = require("jsonwebtoken");

const SECRET_KEY = "12345aA@";

exports.login = async (req, res) => {
  try {
    const { taikhoan, matkhau, guest_id } = req.body;
    console.log("📥 BODY:", req.body);

    if (!taikhoan || !matkhau) {
      return res.status(400).json({ message: "Vui lòng nhập tài khoản và mật khẩu!" });
    }

    // Lấy user theo username
    const user = await new Promise((resolve, reject) => {
      user_account.findByAccount(taikhoan, (err, result) => {
        if (err) {
          console.error("❌ DB error:", err);
          return reject(err);
        }
        resolve(result);
      });
    });

    if (!user) {
      return res.status(401).json({ message: "Tài khoản không tồn tại!" });
    }

    // So sánh mật khẩu (nếu đã hash thì dùng bcrypt.compare)
    const isMatch = matkhau === user.password; // chỉ tạm, sau này thay bằng bcrypt
    if (!isMatch) {
      return res.status(401).json({ message: "Mật khẩu không đúng!" });
    }

    // Tạo token JWT
    const token = jwt.sign(
      { id_user: user.user_id, taikhoan: user.username },
      SECRET_KEY,
      { expiresIn: "365h" }
    );

    // Merge giỏ hàng guest -> customer (nếu có guest_id)
    if (guest_id && user.customer_id) {
      const guestCart = await new Promise((resolve, reject) => {
        CartModel.findCart(null, guest_id, (err, cart) => {
          if (err) return reject(err);
          resolve(cart);
        });
      });

      if (guestCart) {
        let customerCart = await new Promise((resolve, reject) => {
          CartModel.findCart(user.customer_id, null, (err, cart) => {
            if (err) return reject(err);
            resolve(cart);
          });
        });

        if (!customerCart) {
          const newCartId = await new Promise((resolve, reject) => {
            CartModel.createCart(user.customer_id, null, (err, id) => {
              if (err) return reject(err);
              resolve({ cart_id: id });
            });
          });
          customerCart = newCartId;
        }

        const guestItems = await new Promise((resolve, reject) => {
          CartModel.getCartItems(guestCart.cart_id, (err, items) => {
            if (err) return reject(err);
            resolve(items);
          });
        });

        // Merge items song song
        await Promise.all(
          guestItems.map(item => new Promise((resolve, reject) => {
            CartModel.addOrUpdateItem(
              customerCart.cart_id,
              item.variant_id,
              item.quantity,
              (err) => err ? reject(err) : resolve()
            );
          }))
        );

        // Xóa cart guest
        await new Promise((resolve, reject) => {
          db.query("DELETE FROM cart WHERE cart_id = ?", [guestCart.cart_id], (err) => {
            if (err) return reject(err);
            resolve();
          });
        });
      }
    }

    res.json({
      message: "Đăng nhập thành công!",
      token,
      user: {
        id_user: user.user_id,
        taikhoan: user.username,
        customer_id: user.customer_id,
        quyen: user.role,
      },
    });

  } catch (err) {
    console.error("🔥 Login error:", err);
    res.status(500).json({ message: "Lỗi server!", error: err.message });
  }
};