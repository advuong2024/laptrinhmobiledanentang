const Product_details = require("../models/product_details.model");
module.exports = {
  getAll: (req, res) => {
    Product_details.getAll((result) => {
      res.send(result);
    });
  },
  getById: (req, res) => {
    const id = req.params.id;
    Product_details.getById(id, (result) => {
      res.send(result);
    });
  },
  insert: (req, res) => {
    const product_details = req.body;
    Product_details.insert(product_details, (result) => {
      res.send(result);
    });
  },
  update: (req, res) => {
    const product_details = req.body;
    const id = req.params.id;
    Product_details.update(product_details, id, (result) => {
      res.send(result);
    });
  },
  delete: (req, res) => {
    const id = req.params.id;
    Product_details.delete(id, (result) => {
      res.send(result);
    });
  },
  GetByIDProduct: (req, res) => {
    const id = req.params.id;
    Product_details.GetByIDProduct(id, (result) => {
      res.send(result);
    });
  },
};
