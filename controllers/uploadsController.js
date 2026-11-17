const path = require('path');
const fs = require('fs');
const { StatusCodes } = require('http-status-codes');
const cloudinary = require('cloudinary').v2;
const CustomError = require('../errors');

const uploadProductImageLocal = async (req, res) => {
  if (!req.files) { // express-fileupload кладе файли в req.files; немає — файл не надіслали
    throw new CustomError.BadRequestError('No File Uploaded');
  }

  const productImage = req.files.image; // 'image' — ключ, під яким фронтенд додав файл у FormData

  if (!productImage.mimetype.startsWith('image')) { // mimetype виду 'image/jpeg' — відсікаємо не-картинки
    throw new CustomError.BadRequestError('Please Upload Image');
  }

  const maxSize = 1024 * 1024; // 1MB у байтах

  if (productImage.size > maxSize) {
    throw new CustomError.BadRequestError('Please upload image smaller 1MB');
  }

  // Абсолютний шлях від __dirname — не залежить від того, звідки запущено node
  const imagePath = path.join(
    __dirname,
    '../public/uploads/' + `${productImage.name}`
  );

  await productImage.mv(imagePath); // переносить файл; папка public/uploads має вже існувати (інакше ENOENT)

  // src відносно public/ — express.static віддасть файл за цією адресою
  return res
    .status(StatusCodes.OK)
    .json({ image: { src: `/uploads/${productImage.name}` } });
};

const uploadProductImage = async (req, res) => {
  // useTempFiles зберіг файл у ./tmp — Cloudinary отримує шлях до нього, а не сам буфер
  const result = await cloudinary.uploader.upload(
    req.files.image.tempFilePath,
    {
      use_filename: true, // ім'я в хмарі на основі назви файлу, а не випадковий id
      filename_override: req.files.image.name, // поза курсом: оригінальна назва замість tmp-1-...
      folder: 'file-upload', // папка в Cloudinary Media Library
    }
  );

  fs.unlinkSync(req.files.image.tempFilePath); // файл уже в хмарі — тимчасову копію в ./tmp видаляємо

  return res.status(StatusCodes.OK).json({ image: { src: result.secure_url } }); // secure_url — https-посилання на картинку
};

module.exports = {
  uploadProductImageLocal,
  uploadProductImage,
};
