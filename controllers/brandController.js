const asyncHandler = require("express-async-handler");

const factory = require("./handlersFactory");
const { uploadSingleImage } = require("../middlewares/imageUpload");
const Brand = require("../models/brandModel");

const ApiError = require("../utils/apiError");
const { uploadToCloudinary } = require("../utils/UploadToCloudinary");

exports.uploadBrandImage = uploadSingleImage("image");

// Resize image
exports.resizeImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new ApiError(`can't found brand image`));
  try {
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: "brands",
      transformation: [
        { aspect_ratio: "1:1", gravity: "auto", width: 250, crop: "auto" },
        { radius: 35 },
      ],
    });

    req.body.image = result.url;
    next();
  } catch (error) {
    next(new ApiError("can't upload brand image"));
  }
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
