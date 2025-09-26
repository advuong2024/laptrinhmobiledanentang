const Cart = require("../models/cart.model");
module.exports = {
  getAll: (req, res) => {
    Cart.getAll((result) => {
      res.send(result);
    });
  },
  getById: (req, res) => {
    const id = req.params.id;
    Cart.getById(id, (result) => {
      res.send(result);
    });
  },
  insert: (req, res) => {
    const cart = req.body;
    Cart.insert(cart, (result) => {
      res.send(result);
    });
  },
  update: (req, res) => {
    const cart = req.body;
    const id = req.params.id;
    Cart.update(cart, id, (result) => {
      res.send(result);
    });
  },
  delete: (req, res) => {
    const id = req.params.id;
    Cart.delete(id, (err, result) => {
      if (err) return res.status(400).json({ error: err });
      res.json({ message: result });
    });
  },

  addToCart: (req, res) => {
    const { customer_id, guest_id, variant_id, quantity } = req.body;
    console.log("📥 addToCart body:", req.body);

    Cart.findCart(customer_id, guest_id, (err, cart) => {
      if (err) return res.status(500).json({ error: err });

      function handleAdd(cart_id) {
        Cart.addOrUpdateItem(cart_id, variant_id, quantity, (err2) => {
          if (err2) return res.status(500).json({ error: err2 });

          Cart.getCartItems(cart_id, (err3, items) => {
            if (err3) return res.status(500).json({ error: err3 });
            const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
            res.json({ cart_id, totalQuantity, items });
          });
        });
      }

      if (!cart) {
        Cart.createCart(customer_id, guest_id, (err2, cartId) => {
          if (err2) return res.status(500).json({ error: err2 });
          handleAdd(cartId);
        });
      } else {
        handleAdd(cart.cart_id);
      }
    });
  },

  getCart: (req, res) => {
    const { customer_id, guest_id } = req.query;

    Cart.findCart(customer_id, guest_id, (err, cart) => {
      if (err) return res.status(500).send(err);

      if (!cart) return res.json({ totalQuantity: 0, items: [] });

      Cart.getCartItems(cart.cart_id, (err, items) => {
        if (err) return res.status(500).send(err);

        const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
        res.json({ cart_id: cart.cart_id, totalQuantity, items });
      });
    });
  },
};

