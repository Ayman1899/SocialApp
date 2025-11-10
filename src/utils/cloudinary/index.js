import dotenv from 'dotenv'
import path from 'path'
dotenv.config({path: path.resolve("../../../config/.env")})
import { v2 as cloudinary } from 'cloudinary'
cloudinary.config({
    cloud_name: process.env.CLOUD_ID,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})

export default cloudinary