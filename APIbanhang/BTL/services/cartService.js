const CartModel = require("../models/cart.model");
const db = require("../common/db");

async function mergeCart(guest_id, customer_id) {
  if (!guest_id || !customer_id) return;

  // Lấy giỏ hàng guest
  const guestCart = await new Promise((resolve, reject) => {
    CartModel.findCart(null, guest_id, (err, cart) => {
      if (err) return reject(err);
      resolve(cart);
    });
  });

  if (!guestCart) return;

  // Lấy giỏ hàng customer
  let customerCart = await new Promise((resolve, reject) => {
    CartModel.findCart(customer_id, null, (err, cart) => {
      if (err) return reject(err);
      resolve(cart);
    });
  });

  if (!customerCart) {
    const newCartId = await new Promise((resolve, reject) => {
      CartModel.createCart(customer_id, null, (err, id) => {
        if (err) return reject(err);
        resolve({ cart_id: id });
      });
    });
    customerCart = newCartId;
  }

  // Lấy items của guest
  const guestItems = await new Promise((resolve, reject) => {
    CartModel.getCartItems(guestCart.cart_id, (err, items) => {
      if (err) return reject(err);
      resolve(items);
    });
  });

  // Merge từng item
  for (const item of guestItems) {
    const existing = await new Promise((resolve, reject) => {
      CartModel.findItem(customerCart.cart_id, item.variant_id, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    if (existing) {
      // update cộng dồn
      await new Promise((resolve, reject) => {
        CartModel.updateItemQuantity(
          customerCart.cart_id,
          item.variant_id,
          existing.quantity + item.quantity,
          (err) => err ? reject(err) : resolve()
        );
      });
    } else {
      // thêm mới
      await new Promise((resolve, reject) => {
        CartModel.addItem(
          customerCart.cart_id,
          item.variant_id,
          item.quantity,
          (err) => err ? reject(err) : resolve()
        );
      });
    }
  }

  // Xóa cart guest sau khi merge
  await new Promise((resolve, reject) => {
    db.query("DELETE FROM cart WHERE cart_id = ?", [guestCart.cart_id], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

module.exports = { mergeCart };
