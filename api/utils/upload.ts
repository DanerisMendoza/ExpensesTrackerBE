const multer = require('multer');
const path = require('path');
import { Request, Response, NextFunction } from 'express';

const checkFileType = (file: any, cb: any) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images only! (jpeg, jpg, png, gif)');
    }
}

const storage = multer.diskStorage({
    destination: function (req:Request, file:any, cb:any) {
        cb(null, 'uploads/'); // Set your desired upload directory
    },
    filename: function (req:Request, file:any, cb:any) {
        cb(null, file.originalname);
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 },
    fileFilter: function (req:Request, file:any, cb:any) {
        checkFileType(file, cb);
    }
});

export { checkFileType, storage, upload };