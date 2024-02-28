const cloudinary = require("../config/cloudinary");

exports.uploadToCloudinary = (buffer, { ...options }) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          format: "webp",
          ...options,
        },
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      )
      .end(buffer);
  });
