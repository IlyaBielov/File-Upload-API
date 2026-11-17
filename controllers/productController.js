const Product = require('../models/Product');
const { StatusCodes } = require('http-status-codes');

const createProduct = async (req, res) => {
  const product = await Product.create(req.body); // image у req.body — це src, який повернув /uploads
  res.status(StatusCodes.CREATED).json({ product });
};

const getAllProducts = async (req, res) => {
  const products = await Product.find({});
  res.status(StatusCodes.OK).json({ products });
};

module.exports = {
  createProduct,
  getAllProducts,
};
