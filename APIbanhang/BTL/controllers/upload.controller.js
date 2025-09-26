// module.exports = {
//     uploadImage: (req, res) => {
//         try {
//         if (!req.file) {
//             return res.status(400).json({ error: 'Không có file nào được tải lên' });
//         }
//         // Tạo URL công khai
//         const imageUrl = `/uploads/${req.file.filename}`;
//         res.status(200).json({
//             message: 'Upload ảnh thành công',
//             url: imageUrl,
//         });
//         } catch (error) {
//         res.status(500).json({ error: error.message });
//         }
//     }
// };

const cloudinary = require('../services/cloudinaryService');

exports.getSignature = (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const paramsToSign = {
      timestamp: timestamp,
      folder: 'signed_uploads'
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      success: true,
      timestamp,
      signature,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
