const Payment = require("../models/payment.model");
module.exports = {
  getAll: (req, res) => {
    Payment.getAll((result) => {
      res.send(result);
    });
  },
  getById: (req, res) => {
    const id = req.params.id;
    Payment.getById(id, (result) => {
      res.send(result);
    });
  },
  insert: (req, res) => {
    const payment = req.body;
    Payment.insert(payment, (result) => {
      res.send(result);
    });
  },
  update: (req, res) => {
    const payment = req.body;
    const id = req.params.id;
    Payment.update(payment, id, (result) => {
      res.send(result);
    });
  },
  delete: (req, res) => {
    const id = req.params.id;
    Payment.delete(id, (result) => {
      res.send(result);
    });
  },
};
