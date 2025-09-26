const Review = require("../models/review.model");
module.exports = {
  getAll: (req, res) => {
    Review.getAll((result) => {
      res.send(result);
    });
  },
  getById: (req, res) => {
    const id = req.params.id;
    Review.getById(id, (result) => {
      res.send(result);
    });
  },
  insert: (req, res) => {
    const review = req.body;
    Review.insert(review, (result) => {
      res.send(result);
    });
  },
  update: (req, res) => {
    const review = req.body;
    const id = req.params.id;
    Review.update(review, id, (result) => {
      res.send(result);
    });
  },
  delete: (req, res) => {
    const id = req.params.id;
    Review.delete(id, (result) => {
      res.send(result);
    });
  },
  GetByProduct: (req, res) => {
    const id = req.params.id;
    Review.GetByProduct(id, (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }
      res.send(result);
    });
  },
  GetReviewStats: (req, res) => {
    const id = req.params.id;
    Review.GetReviewStats(id, (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }
      res.send(result);
    });
  },
};
