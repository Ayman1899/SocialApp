import { postModel } from "../../DB/Models/post.model.js";
import cloudinary from "../../utils/cloudinary/index.js";
import { asyncHandler } from "../../utils/error/index.js";

export const createPost = asyncHandler(async (req, res, next) => {
    
    
    if(req?.files?.length) {
        const images = [];
        for (const file of req.files) {
            console.log(file.path);
            
            const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
                folder: "SocialApp/Posts",
                resource_type: "auto"
            })
            images.push({secure_url, public_id})
        }
        req.body.attachments = images
    }
    
    //We can spread objects into only another objects
    
    const post = await postModel.create({ ...req.body, userId: req.user._id })
    return res.status(201).json({msg: "Done", post})
})