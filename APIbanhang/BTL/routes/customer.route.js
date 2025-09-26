var express = require('express');
var router = express.Router();
const customerController = require("../controllers/customer.controller");
router.get('/', customerController.getAll);
router.get('/:id',  customerController.getById);
router.post('/',  customerController.insert);
router.put('/:id',  customerController.update);
router.delete('/:id', customerController.delete);
module.exports = router;
