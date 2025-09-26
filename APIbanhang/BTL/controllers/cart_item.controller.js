const Cart_item = require("../models/cart_item.model");
module.exports = {
  getAll: (req, res) => {
    Cart_item.getAll((result) => {
      res.send(result);
    });
  },
  getById: (req, res) => {
    const id = req.params.id;
    Cart_item.getById(id, (result) => {
      res.send(result);
    });
  },
  insert: (req, res) => {
    const cart_item = req.body;
    Cart_item.insert(cart_item, (result) => {
      res.send(result);
    });
  },
  update: (req, res) => {
    const cart_item = req.body;
    const id = req.params.id;
    Cart_item.update(cart_item, id, (result) => {
      res.send(result);
    });
  },
  delete: (req, res) => {
    const id = req.params.id;
    Cart_item.delete(id, (err, result) => {
      if (err) return res.status(400).json({ error: err });
      res.json({ message: result });
    });
  },
};
