const User_account = require("../models/user_account.model");
module.exports = {
  getAll: (req, res) => {
    User_account.getAll((result) => {
      res.send(result);
    });
  },
  getById: (req, res) => {
    const id = req.params.id;
    User_account.getById(id, (result) => {
      res.send(result);
    });
  },
  insert: (req, res) => {
    const user_account = req.body;
    User_account.insert(user_account, (result) => {
      res.send(result);
    });
  },
  update: (req, res) => {
    const user_account = req.body;
    const id = req.params.id;
    User_account.update(user_account, id, (result) => {
      res.send(result);
    });
  },
  delete: (req, res) => {
    const id = req.params.id;
    User_account.delete(id, (result) => {
      res.send(result);
    });
  },
  changePassword: (req, res) => {
    const { user_id, oldPassword, newPassword } = req.body;

    console.log("📩 Body nhận được:", req.body); // debug

    if (!user_id || !oldPassword || !newPassword) {
      return res.status(400).json({ message: "Thiếu dữ liệu" });
    }

    User_account.changePassword(user_id, oldPassword, newPassword, (err, result) => {
      if (err) {
        return res.status(400).json({ message: err });
      }
      return res.json({ message: result });
    });
  },
};
