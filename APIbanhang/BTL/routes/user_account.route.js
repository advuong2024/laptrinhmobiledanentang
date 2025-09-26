var express = require('express');
var router = express.Router();
const user_accountController = require("../controllers/user_account.controller");
router.get('/', user_accountController.getAll);
router.get('/:id',  user_accountController.getById);
router.post('/',  user_accountController.insert);
router.put('/:id',  user_accountController.update);
router.delete('/:id', user_accountController.delete);
module.exports = router;
