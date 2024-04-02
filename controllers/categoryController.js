const asyncHandler = require("express-async-handler");

const factory = require("./handlersFactory");
const { uploadSingleImage } = require("../middlewares/imageUpload");
const Category = require("../models/categoryModel");
const ApiError = require("../utils/apiError");
const { uploadToCloudinary } = require("../utils/UploadToCloudinary");

exports.uploadCategoryImage = uploadSingleImage("image");

// Resize image
exports.resizeImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new ApiError(`can't found category image`));
  try {
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: "categories",
      transformation: [
        { aspect_ratio: "1:1", gravity: "auto", width: 250, crop: "auto" },
        { radius: 35 },
      ],
    });
    req.body.image = result.url;
    return next();
  } catch (error) {
    return next(new ApiError("can't not upload image category"));
  }
});

// @desc      Get all categories
// @route     GET /api/v1/categories
// @access    Public
exports.getCategories = factory.getAll(Category);

// @desc      Get specific category by id
// @route     GET /api/v1/categories/:id
// @access    Public
exports.getCategory = factory.getOne(Category);

// @desc      Create category
// @route     POST /api/v1/categories
// @access    Private
exports.createCategory = factory.createOne(Category);

// @desc      Update category
// @route     PATCH /api/v1/categories/:id
// @access    Private
exports.updateCategory = factory.updateOne(Category);

// @desc     Delete category
// @route    DELETE /api/v1/categories/:id
// @access   Private
exports.deleteCategory = factory.deleteOne(Category);

exports.deleteAll = factory.deleteAll(Category);
