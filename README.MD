# File Upload API

REST API for products with an image. The image is uploaded first (to Cloudinary, or to the local
disk), and the product is then created with the returned image URL.
Built while following the "File/Image Upload" section of a Node.js / Express course.

A small front-end in `public/` (plain HTML + axios) is served by the same server.

## Tech stack

Node.js 22 · Express 4 · MongoDB Atlas + Mongoose 9 · express-fileupload · Cloudinary 2 ·
express-async-errors · http-status-codes · dotenv

## Getting started

```bash
npm install
npm run dev   # nodemon, auto-reload
npm start     # plain node
```

Create `.env` in the project root:

```env
PORT=5000
MONGO_URI=<MongoDB Atlas connection string>
CLOUD_NAME=<Cloudinary cloud name>
CLOUD_API_KEY=<Cloudinary API key>
CLOUD_API_SECRET=<Cloudinary API secret>
```

The Cloudinary values are in the Cloudinary console under API Keys.

Then open http://localhost:5000, pick an image and press "add product".

## API

Base URL: `/api/v1/products`.

| Method | Route      | Description                                                        |
|--------|------------|--------------------------------------------------------------------|
| POST   | `/uploads` | Upload an image (`multipart/form-data`, field `image`)             |
| POST   | `/`        | Create product (`name`, `price`, `image`) — returns `{ product }`  |
| GET    | `/`        | All products — `{ products }`                                      |

`POST /uploads` returns `{ image: { src } }`. Send that `src` as `image` when creating the product:

```bash
curl -X POST http://localhost:5000/api/v1/products/uploads -F image=@images/computer-1.jpeg
# { "image": { "src": "https://res.cloudinary.com/<cloud>/image/upload/.../file-upload/computer-1_xxxxxx.jpg" } }

curl -X POST http://localhost:5000/api/v1/products \
  -H 'Content-Type: application/json' \
  -d '{ "name": "computer", "price": 150.99, "image": "<src from the upload>" }'
```

Errors always come back as `{ msg }`. A product with a missing field returns 400 (Mongoose
validation error).

## How the upload works

```
choose a file  ->  POST /uploads (multipart/form-data)
                     express-fileupload writes the file to ./tmp and fills req.files.image
                     cloudinary.uploader.upload(tempFilePath)  -> folder "file-upload"
                     fs.unlinkSync(tempFilePath)               -> ./tmp is cleaned up
                   <- { image: { src: secure_url } }

"add product"  ->  POST /  { name, price, image: src }  ->  MongoDB
```

Only the image URL is stored in the database, never the file itself.

### Local upload variant

`uploadProductImageLocal` in `controllers/uploadsController.js` saves the file to `public/uploads`
instead of Cloudinary and returns `{ image: { src: '/uploads/<file name>' } }`. It rejects a request
with no file, a non-image file, or a file larger than 1 MB (400).

To use it, point the `/uploads` route in `routes/productRoutes.js` at `uploadProductImageLocal`.
Notes:

- `public/uploads` must exist (it is kept in the repo with `.gitkeep`; its contents are gitignored)
- files with the same name overwrite each other
- on hosts with an ephemeral disk the uploaded files are lost on every deploy

## Project structure

```
app.js                             # static, json, fileUpload, cloudinary.config, routes, start()
db/connect.js                      # mongoose.connect
models/Product.js                  # name, price, image (URL string) — all required
controllers/productController.js   # createProduct, getAllProducts
controllers/uploadsController.js   # uploadProductImage (Cloudinary), uploadProductImageLocal
routes/productRoutes.js            # /  and  /uploads
middleware/error-handler.js        # maps Mongoose/Mongo errors to status codes
errors/                            # CustomAPIError + BadRequest / Unauthenticated / NotFound
public/                            # front-end: index.html, browser-app.js, styles
images/                            # sample images to try the upload with
```

## Differences from the course

- `cloudinary` 2.x instead of 1.x, Mongoose 9, Express 4.21, Node 22 — the lesson code works the same
- `filename_override` keeps the original file name in Cloudinary; without it the asset is named
  after the temp file (`tmp-1-...`)
- Both upload controllers are exported, so switching between Cloudinary and local is a one-word change

## Known limitations

- The Cloudinary upload does not check the file type or size (same as the course); only the local
  variant does
- A temp file is left in `./tmp` when an upload is rejected
- The file type check relies on the `mimetype` sent by the client
- `middleware/authentication.js` is a leftover from the Jobs API starter and is not used
