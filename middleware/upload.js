const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const dotenv = require('dotenv');

dotenv.config();

// Configure Cloudinary (SDK automatically picks up CLOUDINARY_URL from env)
// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// Configure Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'solar-app', // Folder name in Cloudinary
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'avif'],
        // transformation: [{ width: 500, height: 500, crop: 'limit' }], // Optional
    },
});

/* 
// Previous Disk Storage (Commented out)
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});
*/

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|webp|gif|svg|avif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype) || file.mimetype === 'image/svg+xml';

    console.log(`Checking file: ${file.originalname}, Mime: ${file.mimetype}, Ext: ${path.extname(file.originalname)}`);
    if (extname && mimetype) {
        return cb(null, true);
    } else {
        console.error('File rejected:', file.originalname, file.mimetype);
        cb(new Error(`Images only! Rejected: ${file.originalname} (${file.mimetype})`));
    }
}

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

module.exports = upload;
