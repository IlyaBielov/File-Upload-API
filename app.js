require('dotenv').config();
require('express-async-errors');

const express = require('express');
const app = express();

const fileUpload = require('express-fileupload');
// USE V2
const cloudinary = require('cloudinary').v2;
// Налаштовуємо один раз тут — контролер бере вже сконфігурований cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// database
const connectDB = require('./db/connect');

// product router
const productRouter = require('./routes/productRoutes');

// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.use(express.static('./public')); // public/ доступна з браузера: index.html і /uploads/<name>

app.use(express.json());
app.use(fileUpload({ useTempFiles: true })); // multipart/form-data → req.files; файл пишеться в ./tmp, а не в пам'ять

// Цей роут уже не спрацьовує: express.static вище віддає public/index.html на '/'
app.get('/', (req, res) => {
  res.send('<h1>File Upload Starter</h1>');
});

app.use('/api/v1/products', productRouter);

// middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);

    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
