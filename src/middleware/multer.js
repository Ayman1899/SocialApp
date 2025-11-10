import multer from 'multer'
import { nanoid } from 'nanoid'
import fs from 'fs'
import path from 'path'
export const extentionTypes = {
    image: ["image/png", "image/jpeg", "image/gif"],
    video: ["video/mp4"],
    audio: ["audio/mpeg"],
    pdf: ["application/pdf"]
}

export const multerLocal = (customValidation = [], customPath = "Generals") => {
    const fullPath = path.resolve("./src/uploads/", customPath)
    if(!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true }) // recursive creates the path from it's beginning(Indicates whether parent folders should be created.)
    }
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, fullPath)
        },
        filename: (req, file, cb) => { // if two images are uploaded with the same name they're overwritten.

            cb(null, nanoid(4) + file.originalname) // adds random numbers to prevent overwritting images.
        }
    })
    function fileFilter(req, file, cb) {
        if (customValidation.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error("Invalid file format"), false)
        }
    }
    const upload = multer({ fileFilter, storage })
    return upload
}

export const multerHost = (customValidation = []) => {

    const storage = multer.diskStorage({})

    function fileFilter(req, file, cb) {
        if (customValidation.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error("Invalid file format"), false)
        }
    }
    
    const upload = multer({ fileFilter, storage })
    return upload
}