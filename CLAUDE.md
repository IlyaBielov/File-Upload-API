# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Context

Section **07-file-upload** (Udemy "Section 11: File/Image Upload", 14 lessons) of a Node.js/Express course. A small standalone project: products with an image — upload the image first locally to `public/uploads` (express-fileupload), then to **Cloudinary**, then create the product with the returned image URL. The front-end is prebuilt in `public/` (`index.html`, `browser-app.js` with axios from a CDN) and calls `/api/v1/products` and `/api/v1/products/uploads`.

The starter is the course's code (empty `controllers/`, `models/Product.js`, `routes/productRoutes.js`), prepared on 2026-11-16: dependencies bumped, `db/connect.js` simplified, `.env` created. `README.MD` is empty in this section, so `../final/` is the only reference. Section finished on 2026-11-17: `starter/` is its own git repo, pushed to `github.com/IlyaBielov/File-Upload-API` (`main`). `/uploads` uses Cloudinary; the local variant stays exported. Push only when Ilya says so.

A completed reference implementation lives at `../final/` — consult it to see where a lesson is heading. Do **not** copy-paste from `final/`; Ilya is learning and types the code himself. Offer snippets inline or explain instead.

## Commands

- `npm install`
- `npm run dev` — nodemon (local); `npm start` — plain node
- No lint/test setup. Port 5000 is shared with other sections' dev servers — run one at a time.

## Environment

`.env` (gitignored):
- `PORT=5000`
- `MONGO_URI` — Atlas `Cluster0`, DB `07-FILE-UPLOAD`
- `CLOUD_NAME`, `CLOUD_API_KEY`, `CLOUD_API_SECRET` — empty until the Cloudinary lesson; Ilya fills them from Cloudinary Dashboard → API Keys

## Target architecture (`../final/`)

- **app.js** — `express.static('./public')`, `express.json()`, `fileUpload({ useTempFiles: true })`, `cloudinary.config(...)` from env, `/api/v1/products` router, notFound + errorHandler; `start()` awaits `connectDB`.
- **models/Product.js** — `name` (String), `price` (Number), `image` (String) — all required.
- **controllers/productController.js** — `createProduct`, `getAllProducts`.
- **controllers/uploadsController.js** — `uploadProductImageLocal` (checks `req.files`, mimetype `image/*`, size ≤ 1MB, `productImage.mv()` to `public/uploads`, returns `{ image: { src: '/uploads/<name>' } }`) and `uploadProductImage` (Cloudinary `uploader.upload(tempFilePath, { use_filename: true, folder: 'file-upload' })`, `fs.unlinkSync` the temp file, returns `{ image: { src: secure_url } }`).
- **routes/productRoutes.js** — `/` POST+GET, `/uploads` POST.

## Version differences vs the course

Bumped: `mongoose` 9.12.1 (exact), `jsonwebtoken` 9, `dotenv` 16, `express` 4.21, `nodemon` 3, **`cloudinary` 2** (course: 1.x — 1.x has a high-severity advisory). `require('cloudinary').v2` + `config` / `uploader.upload` work the same in 2.x. `npm audit --omit=dev` → 0 vulnerabilities. Node 22 (`engines`).

Gotchas to watch for in the lessons:
- `public/uploads/` is kept via `.gitkeep` (its contents are gitignored) — without the folder `mv()` fails with ENOENT.
- `useTempFiles: true` writes to `./tmp` (gitignored); the Cloudinary controller deletes the temp file, the local one doesn't.
- `express.static('./public')` is relative to the cwd — `path.join(__dirname, 'public')` is safer.
- `middleware/authentication.js` requires `../models/User`, which doesn't exist in this project — it's leftover from Jobs API and never used.
- Mongoose 9 notes (if needed): `pre('save')` without `next`; `{ returnDocument: 'after' }` instead of `{ new: true }`; `new mongoose.Types.ObjectId(...)`.

## Course workflow

- When Ilya asks for help implementing something, explain the concept and show the code inline — don't write it to his files unless he explicitly asks.
- If he's stuck, compare his code against `../final/` mentally and point out specific differences rather than dumping the whole reference.
- After a lesson he runs `/lesson-explain`; he often asks to commit afterwards; push only when he says so.
