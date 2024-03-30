const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");

const factory = require("./handlersFactory");
const { uploadSingleImage } = require("../middlewares/imageUpload");
const Brand = require("../models/brandModel");
const cloudinary = require("../config/cloudinary");
const ApiError = require("../utils/apiError");

exports.uploadBrandImage = uploadSingleImage("image");

// Resize image
exports.resizeImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();
  const file = await sharp(req.file.buffer)
    // .resize(500, 500)
    .toFormat("webp")
    .webp({ quality: 90 })
    .toBuffer();

  cloudinary.uploader
    .upload_stream(
      {
        folder: "brands",
        format: "webp",
        transformation: [
          { aspect_ratio: "1:1", gravity: "auto", width: 250, crop: "auto" },
          { radius: 35 },
        ],
      },
      (err, result) => {
        if (err) return next(new ApiError("can't upload brand image"));

        req.body.image = result.url;
        next();
      }
    )
    .end(file);
});

// @desc      Get all brands
// @route     GET /api/v1/brands
// @access    Public
exports.getBrands = factory.getAll(Brand);

// @desc      Get specific brand by id
// @route     GET /api/v1/brands/:id
// @access    Public
exports.getBrand = factory.getOne(Brand);
// @desc      Create brand
// @route     POST /api/v1/brands
// @access    Private
exports.createBrand = factory.createOne(Brand);

// @desc      Update brand
// @route     PATCH /api/v1/brands/:id
// @access    Private
exports.updateBrand = factory.updateOne(Brand);

// @desc     Delete brand
// @route    DELETE /api/v1/brands/:id
// @access   Private
exports.deleteBrand = factory.deleteOne(Brand);

exports.deleteAll = factory.deleteAll(Brand);
