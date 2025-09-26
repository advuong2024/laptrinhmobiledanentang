const Category = require("../models/category.model");
module.exports = {
  getAll: (req, res) => {
    Category.getAll((err, result) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      res.send(result);
    });
  },
  getById: (req, res) => {
    const id = req.params.id;
    Category.getById(id, (err, result) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      res.send(result);
    });
  },
  insert: (req, res) => {
    const category = req.body;
    Category.insert(category, (err, result) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      res.send(result);
    });
  },
  update: (req, res) => {
    const category = req.body;
    const id = req.params.id;
    Category.update(category, id, (err, result) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      res.send(result);
    });
  },
  delete: (req, res) => {
    const id = req.params.id;
    Category.delete(id, (err, result) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      res.send(result);
    });
  },
  GetByCategoryID: (req, res) => {
    const id = req.params.id;
    Category.GetByCategoryID(id, (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }
      res.send(result);
    });
  },
};