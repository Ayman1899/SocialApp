import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        minLength: 2,
        trim: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    attachments: {
        secure_url: String,
        public_id: String
    }, 
    likes: {
        type: mongoose.Schema.Types.ObjectId,
    },
    isDeleted: Boolean
},
{
    timestamps: true
})

export const postModel = mongoose.models.Post || mongoose.model("Post", postSchema)