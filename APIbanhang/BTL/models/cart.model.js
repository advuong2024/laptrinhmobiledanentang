const db = require("../common/db");

const Cart = (cart) => {
  this.cart_id = cart.cart_id;
  this.customer_id = cart.customer_id;
  this.guest_id = cart.guest_id;
};

Cart.getById = (cart_id, callback) => {
  const sqlString = "SELECT * FROM cart WHERE cart_id = ? ";
  db.query(sqlString, [cart_id], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result[0]);
  });
};

Cart.getAll = (callback) => {
  const sqlString = "SELECT * FROM cart";
  db.query(sqlString, (err, result) => {
    if (err) return callback(err, null);
    callback(null, result);
  });
};

Cart.insert = (cart, callback) => {
  const sqlString = "INSERT INTO cart SET ?";
  db.query(sqlString, cart, (err, res) => {
    if (err) return callback(err, null);
    callback(null, { cart_id: res.insertId, ...cart });
  });
};

Cart.update = (cart, cart_id, callback) => {
  const sqlString = "UPDATE cart SET ? WHERE cart_id = ?";
  db.query(sqlString, [cart, cart_id], (err, res) => {
    if (err) return callback(err, null);
    callback(null, `Cập nhật cart_id = ${cart_id} thành công`);
  });
};

Cart.delete = (cart_id, callback) => {
  db.query("DELETE FROM cart WHERE cart_id = ?", [cart_id], (err, res) => {
    if (err) return callback(err, null);
    if (res.affectedRows === 0) return callback(new Error("Không tìm thấy item để xóa"), null);
    callback(null, { message: `Xóa cart_id = ${cart_id} thành công` });
  });
};

Cart.findCart = (customerId, guestId, callback) => {
  let sql = "SELECT * FROM cart WHERE ";
  let params = [];

  if (customerId) {
    sql += "customer_id = ?";
    params.push(customerId);
  } else {
    sql += "guest_id = ?";
    params.push(guestId);
  }

  db.query(sql, params, (err, result) => {
    if (err) return callback(err, null);
    callback(null, result[0] || null);
  });
};

Cart.createCart = (customerId, guestId, callback) => {
  const sqlString = "INSERT INTO cart (customer_id, guest_id) VALUES (?, ?)";
  db.query(sqlString, [customerId || null, guestId || null], (err, res) => {
    if (err) return callback(err, null);
    callback(null, res.insertId);
  });
};

Cart.addOrUpdateItem = (cartId, variantId, quantity, callback) => {
  db.query(
    "SELECT * FROM cart_item WHERE cart_id = ? AND variant_id = ?",
    [cartId, variantId],
    (err, rows) => {
      if (err) return callback(err, null);

      if (rows.length > 0) {
        db.query(
          "UPDATE cart_item SET quantity = quantity + ? WHERE cart_id = ? AND variant_id = ?",
          [quantity, cartId, variantId],
          (err2) => {
            if (err2) return callback(err2, null);
            callback(null, "Updated quantity");
          }
        );
      } else {
        db.query(
          "INSERT INTO cart_item (cart_id, variant_id, quantity) VALUES (?, ?, ?)",
          [cartId, variantId, quantity],
          (err2) => {
            if (err2) return callback(err2, null);
            callback(null, "Inserted new item");
          }
        );
      }
    }
  );
};

Cart.getCartItems = (cartId, callback) => {
  const sqlString = `
    SELECT ci.cart_item_id, ci.quantity, pv.variant_id, pv.color, pv.size, pv.image, 
           p.product_id, p.product_name, p.price
    FROM cart_item ci
    JOIN product_variant pv ON ci.variant_id = pv.variant_id
    JOIN product p ON pv.product_id = p.product_id
    WHERE ci.cart_id = ?`;

  db.query(sqlString, [cartId], (err, rows) => {
    if (err) return callback(err, null);
    callback(null, rows);
  });
};

module.exports = Cart;
