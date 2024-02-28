const sharp = require("sharp");
const expressAsyncHandler = require("express-async-handler");
const multer = require("multer");
const ApiError = require("../utils/apiError");
const Product = require("../models/productModel");
const factory = require("./handlersFactory");
const { uploadToCloudinary } = require("../utils/UploadToCloudinary");
// Storage
const multerStorage = multer.memoryStorage();

// Accept only images
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new ApiError("only images allowed", 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadProductImages = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 5 },
]);
exports.resizeImageCover = expressAsyncHandler(async (req, res, next) => {
  if (req.files && req.files.imageCover) {
    const imageCover = await sharp(req.files.imageCover[0].buffer)
      .toFormat("webp")
      .webp({
        quality: 90,
      })
      .toBuffer();
    // note this information before update only buffer is updated
    req.files.imageCover[0].buffer = imageCover;
  }
  next();
});
exports.uploadImageCover = expressAsyncHandler(async (req, res, next) => {
  try {
    if (req.files && req.files.imageCover && req.files.imageCover.length) {
      const result = await uploadToCloudinary(req.files.imageCover[0].buffer, {
        folder: "products",
      });
      req.body.imageCover = result.url;
    }
    next();
  } catch (error) {
    next(new ApiError("can't upload cover image"));
  }
});
exports.uploadImages = expressAsyncHandler(async (req, res, next) => {
  try {
    if (req.files && req.files.images && req.files.images.length) {
      const images = req.files.images.map(async (img) => {
        const result = await uploadToCloudinary(img.buffer, {
          folder: "products",
        });
        return result.url;
      });
      const imgsUrls = await Promise.all(images);
      req.body.images = imgsUrls;
    }
    next();
  } catch (error) {
    next(new ApiError("can't upload product images"));
  }
});

// @desc      Get all products
// @route     GET /api/v1/products
// @access    Public
exports.getProducts = factory.getAll(Product, "Products");

// @desc      Get specific product by id
// @route     GET /api/v1/products/:id
// @access    Public
exports.getProduct = factory.getOne(Product, "reviews brand");

// @desc      Create product
// @route     POST /api/v1/products
// @access    Private
exports.createProduct = factory.createOne(Product);
// @desc      Update product
// @route     PATCH /api/v1/products/:id
// @access    Private
exports.updateProduct = factory.updateOne(Product);

// @desc     Delete product
// @route    DELETE /api/v1/products/:id
// @access   Private
exports.deleteProduct = factory.deleteOne(Product);
