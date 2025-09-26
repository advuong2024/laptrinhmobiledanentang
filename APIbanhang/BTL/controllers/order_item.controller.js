const Order_item = require("../models/order_item.model");
module.exports = {
  getAll: (req, res) => {
    Order_item.getAll((result) => {
      res.send(result);
    });
  },
  getById: (req, res) => {
    const id = req.params.id;
    Order_item.getById(id, (result) => {
      res.send(result);
    });
  },
  insert: (req, res) => {
    const order_item = req.body;
    Order_item.insert(order_item, (result) => {
      res.send(result);
    });
  },
  update: (req, res) => {
    const order_item = req.body;
    const id = req.params.id;
    Order_item.update(order_item, id, (result) => {
      res.send(result);
    });
  },
  delete: (req, res) => {
    const id = req.params.id;
    Order_item.delete(id, (result) => {
      res.send(result);
    });
  },
};
