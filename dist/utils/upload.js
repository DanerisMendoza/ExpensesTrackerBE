"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = exports.storage = exports.checkFileType = void 0;
const multer = require('multer');
const path = require('path');
const checkFileType = (file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    }
    else {
        cb('Error: Images only! (jpeg, jpg, png, gif)');
    }
};
exports.checkFileType = checkFileType;
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Set your desired upload directory
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
exports.storage = storage;
const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});
exports.upload = upload;
//# sourceMappingURL=upload.js.map