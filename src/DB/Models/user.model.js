
import mongoose from "mongoose";

export const genderTypes = {
    male: "Male",
    female: "Female"
}

export const roleTypes = {
    user: "User",
    admin: "Admin"
}

export const providerTypes = {
    system: "System",
    google: "Google"
}

const userSchema = new mongoose.Schema({
    provider: {
        type: String,
        enum: Object.values(providerTypes),
        default: providerTypes.system
    },
    name: {
        type: String,
        minLength: 3,
        maxLength: 30,
        trim: true,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: function() {
            return this.provider == providerTypes.system ? true : false
        },
        trim: true,
        minLength: 8
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    gender: {
        type: String,
        enum: Object.values(genderTypes),
        required: true
    },
    role: {
        type: String,
        enum: Object.values(roleTypes),
        default: roleTypes.user
    },
    confirmed: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    passwordChangedAt: Date,
    image: {
        secure_url: String,
        public_id: String
    },
    coverImages: [{
        secure_url: String,
        public_id: String
    }],
    otpEmail: String,
    otpForgetPassword: String,
    viewers: [{
        userId: {type: mongoose.Schema.Types.ObjectId, ref: "User" },
        time: [Date]
    }],
    tempEmail: String,
    otpNewEmail: String,
},
{
    timestamps: true,
})

export const userModel = mongoose.models.User || mongoose.model("User", userSchema)


