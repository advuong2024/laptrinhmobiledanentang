var express = require('express');
var router = express.Router();
const cart_itemController = require("../controllers/cart_item.controller");
router.get('/', cart_itemController.getAll);
router.get('/:id',  cart_itemController.getById);
router.post('/',  cart_itemController.insert);
router.put('/:id',  cart_itemController.update);
router.delete('/:id', cart_itemController.delete);
module.exports = router;
