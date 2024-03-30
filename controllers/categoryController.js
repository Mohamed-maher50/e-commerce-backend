const sharp = require("sharp"); // image processing lib for nodejs
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");

const factory = require("./handlersFactory");
const { uploadSingleImage } = require("../middlewares/imageUpload");
const Category = require("../models/categoryModel");
const cloudinary = require("../config/cloudinary");
const ApiError = require("../utils/apiError");

// exports.uploadCategoryImage = upload.single('image');
exports.uploadCategoryImage = uploadSingleImage("image");

// Resize image
exports.resizeImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();
  const file = await sharp(req.file.buffer).resize(250, 250).toBuffer();
  cloudinary.uploader
    .upload_stream(
      {
        folder: "categories",
        format: "png",
        transformation: [
          { aspect_ratio: "1:1", gravity: "auto", width: 250, crop: "auto" },
          { radius: 35 },
        ],
      },
      (err, result) => {
        if (!err) {
          req.body.image = result.url;
          return next();
        }
        return next(new ApiError("can't not upload image category"));
      }
    )
    .end(file);
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
