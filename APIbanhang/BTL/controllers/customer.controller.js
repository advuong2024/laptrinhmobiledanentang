const Customer = require("../models/customer.model");
module.exports = {
  getAll: (req, res) => {
    Customer.getAll((result) => {
      res.send(result);
    });
  },
  getById: (req, res) => {
    const id = req.params.id;
    Customer.getById(id, (result) => {
      res.send(result);
    });
  },
  insert: (req, res) => {
    const customer = req.body;
    Customer.insert(customer, (result) => {
      res.send(result);
    });
  },
  update: (req, res) => {
    const customer = req.body;
    const id = req.params.id;
    Customer.update(customer, id, (result) => {
      res.send(result);
    });
  },
  delete: (req, res) => {
    const id = req.params.id;
    Customer.delete(id, (result) => {
      res.send(result);
    });
  },
};
