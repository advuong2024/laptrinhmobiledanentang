var express = require('express');
var router = express.Router();
const productController = require("../controllers/product.controller");
router.get('/', productController.getAll);
router.get('/:id',  productController.getById);
router.post('/',  productController.insert);
router.put('/:id',  productController.update);
router.delete('/:id', productController.delete);
module.exports = router;
