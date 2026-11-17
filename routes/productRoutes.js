const express = require('express');
const router = express.Router();

const {
  createProduct,
  getAllProducts,
} = require('../controllers/productController');
const {
  uploadProductImageLocal,
  uploadProductImage,
} = require('../controllers/uploadsController');

router.route('/').post(createProduct).get(getAllProducts);
// Спершу фронтенд шле картинку сюди, а отриманий src — у POST / разом з name і price
router.route('/uploads').post(uploadProductImage); // Cloudinary; локальний варіант — uploadProductImageLocal

module.exports = router;
