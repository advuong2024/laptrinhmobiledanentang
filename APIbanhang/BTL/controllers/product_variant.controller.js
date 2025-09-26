const Product_variant = require("../models/product_variant.model");
module.exports = {
  getAll: (req, res) => {
    Product_variant.getAll((result) => {
      res.send(result);
    });
  },
  getById: (req, res) => {
    const id = req.params.id;
    Product_variant.getById(id, (result) => {
      res.send(result);
    });
  },
  insert: (req, res) => {
    const product_variant = req.body;
    Product_variant.insert(product_variant, (result) => {
      res.send(result);
    });
  },
  update: (req, res) => {
    const product_variant = req.body;
    const id = req.params.id;
    Product_variant.update(product_variant, id, (result) => {
      res.send(result);
    });
  },
  delete: (req, res) => {
    const id = req.params.id;
    Product_variant.delete(id, (result) => {
      res.send(result);
    });
  },
  GetByIDProduct: (req, res) => {
    const id = req.params.id;
    Product_variant.GetByIDProduct(id, (result) => {
      res.send(result);
    });
  },
  GetByIDVariant: (req, res) => {
    const id = req.params.id;
    Product_variant.GetByIDVariant(id, (result) => {
      res.send(result);
    });
  },
};
