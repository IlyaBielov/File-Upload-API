const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String, // у базі лише шлях/URL картинки, сам файл лежить на диску чи в хмарі
    required: true,
  },
});

module.exports = mongoose.model('Product', ProductSchema);
