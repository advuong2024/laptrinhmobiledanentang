const Product = require("../models/product.model");
module.exports = {
  getAll: (req, res) => {
    Product.getAll((result) => {
      res.send(result);
    });
  },
  getById: (req, res) => {
    const id = req.params.id;
    Product.getById(id, (result) => {
      res.send(result);
    });
  },
  insert: (req, res) => {
    const product = req.body;
    Product.insert(product, (result) => {
      res.send(result);
    });
  },
  update: (req, res) => {
    const product = req.body;
    const id = req.params.id;
    Product.update(product, id, (result) => {
      res.send(result);
    });
  },
  delete: (req, res) => {
    const id = req.params.id;
    Product.delete(id, (result) => {
      res.send(result);
    });
  },
};
