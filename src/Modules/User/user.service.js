import { providerTypes, roleTypes, userModel } from "../../DB/Models/user.model.js";
import { decodedToken, tokenTypes } from "../../middleware/auth.js";
import cloudinary from "../../utils/cloudinary/index.js";
import { Compare, Encrypt, Hash } from "../../utils/Encryption/index.js";
import { asyncHandler } from "../../utils/error/index.js";
import { eventEmitter} from "../../utils/sendEmail.events/sendEmail.event.js";
import { generateToken, verifyToken } from "../../utils/Token/index.js";
import {OAuth2Client} from 'google-auth-library';

// -------------------------------------------- Sign Up ----------------------------------------------------------------
export const signUp = asyncHandler(async (req, res, next) => {
    
    const {name, email, phone, gender, password} = req.body;
    
    if(await userModel.findOne({email})) {
        return next(new Error("Email already exists", { cause: 409 }))
    }

    if(!req.file) {
        return next(new Error("Please upload an image", { cause: 404 }))
    }

    // if(!req?.files) {
    //     return next(new Error("please upload at least an image", { cause: 404 }))
    // }    
    //console.log(req.files);
    
    // let arrPaths = []
    // for(const file of req.files) {
    //     const { secure_url, public_id } = await cloudinary.uploader.upload(file.path)
    //     arrPaths.push({ secure_url, public_id })
    // }

    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
        folder: "/SocialApp/users",
        //public_id: "ayman",
        //use_filename: true,
        //unique_filename: false,
        resource_type: "image"
    })

    const encryptPhone = await Encrypt({
        key: phone,
        SECRET_KEY: process.env.SECRET_KEY
    })

    const hashedPassword = await Hash({
        key: password,
        SALT_ROUNDS: process.env.SALT_ROUNDS
    })

    const user = await userModel.create({name, email, gender,
        phone: encryptPhone,
        password: hashedPassword,
        image: {secure_url, public_id}
        //coverImages: arrPaths
    })

    eventEmitter.emit("SendEmailConfirmation", {email})

    
    return res.status(201).json({msg: "Done", user})
})

// --------------------------------------------- Confirm Email -------------------------------------------------------------
export const confirmEmail = asyncHandler(async (req, res, next) => {
    const { email, code } = req.body;
    const user = await userModel.findOne({email}, {confirmed: false})
    if(!user) {
        return next(new Error("Email doesn't exist or already confirmed"))
    }

    if(!await Compare({key: code, hashing: user.otpEmail})) {
        return next(new Error("Invalid code", {cause: 404}))
    }
    await userModel.updateOne({email}, {confirmed: true, $unset: {otpEmail: 0}})
    return res.status(200).json({msg: "Done"})
})

// ------------------------------------------------- LOGIN -----------------------------------------------------
export const logIn = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    const user = await userModel.findOne({email, confirmed: true})
    if(!user) {
        return next(new Error("User doesn't exist or not confirmed", { cause: 404 }))
    }
    
    if(!await Compare({key: password, hashing: user.password})) {
        return next(new Error("Invalid email or password", { cause: 404 }))
    }

    const access_token = await generateToken({
        payload: {email, id: user._id},
        signature: user.role == roleTypes.user ? process.env.USER_ACCESS_SIGNATURE : process.env.ADMIN_ACCESS_SIGNATURE,
        options: { expiresIn: "1d" }
    })
    const refresh_token = await generateToken({
        payload: {email, id: user._id},
        signature: user.role == roleTypes.user ? process.env.USER_REFRESH_SIGNATURE : process.env.ADMIN_REFRESH_SIGNATURE,
        options: { expiresIn: "1w" }
    })

    return res.status(202).json({msg: "Done", access_token, refresh_token})
})

// ------------------------------------------------ SOCIAL LOGIN(or SIGNUP) -------------------------------------------------------------
export const loginWithGmail = asyncHandler(async (req, res, next) => {
    const { idToken } = req.body;
    const client = new OAuth2Client();
    async function verify() {
        const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.CLIENT_ID,  
    });
    const payload = ticket.getPayload();
    return payload
    }
    const {name, email, email_verified, picture} = await verify()
    let user = await userModel.findOne({email})
    if(!user) {
        await userModel.create({
            name,
            email,
            confirmed: email_verified,
            image: picture,
            provider: providerTypes.google
        })
    }
    if(user) {
        return next(new Error("Email already exists. please login without google"))
    }
    const access_token = await generateToken({ 
        payload: {email: user.email, id: user._id},
        signature: user.role == roleTypes.user ? process.env.USER_TOKEN_SIGNATURE : process.env.ADMIN_TOKEN_SIGNATURE,
        options: { expiresIn: "1d" }
    })
    return res.status(200).json({msg: "Done", token: access_token})
})

// ----------------------------------------------- REFRESH TOKEN --------------------------------------------------
export const refreshToken = asyncHandler(async (req, res, next) => {
    const { authorization } = req.body
    const user = await decodedToken({authorization, tokenType: tokenTypes.refresh})
    const access_token = await generateToken({ // or Refresh token depends on the business model
        payload: {email: user.email, id: user._id},
        signature: user.role === roleTypes.user ? process.env.USER_ACCESS_SIGNATURE : process.env.ADMIN_ACCESS_SIGNATURE,
        options: { expiresIn: "1d" }
    })

    return res.status(201).json({msg: "Done", access_token})
})

// ----------------------------------------------- FORGET PASSWORD ----------------------------------------------------
export const forgetPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body; 
    if(!await userModel.findOne({email, isDeleted: false})) {
        return next(new Error("Invalid email"))
    }

    eventEmitter.emit("ForgetPassword", {email})

    return res.status(200).json({msg: "check your email"})
})

// ---------------------------------------------- RESET PASSWORD -----------------------------------------------------------
export const resetPassword = asyncHandler(async (req, res, next) => {
    const { email, code, newPassword } = req.body;
    const user = await userModel.findOne({email, isDeleted: false})
    if(!user) {
        return next(new Error("Invalid email"))
    }
    if(!await Compare({key: code, hashing: user.otpForgetPassword})) {
        return next(new Error("Invalid otp", { cause: 401 }))
    }

    const hashed = await Hash({key: newPassword, SALT_ROUNDS: process.env.SALT_ROUNDS})
    await userModel.updateOne({email}, {password: hashed, confirmed: true, $unset: { otpForgetPassword: 0 }})
    return res.status(200).json({msg: "Done"})
})

// ---------------------------------------------- UPDATE PROFILE -------------------------------------------------------------
export const updateProfile = asyncHandler(async (req, res, next) => {
    
    if (req.body.phone) {
        req.body.phone = await Encrypt({key: req.body.phone, SECRET_KEY: process.env.SECRET_KEY})
    }
    if (req.file) {
        await cloudinary.uploader.destroy(req.user.image.public_id)
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
            folder: "SocialApp/users"
        })
        req.body.image = { secure_url, public_id }
    }
    
    const user = await userModel.findByIdAndUpdate({_id: req.user._id}, req.body, { new: true })
    return res.status(200).json({msg: "Done", user})
})

// --------------------------------------------- UPDATE PASSWORD -------------------------------------------------------------
export const updatePassword = asyncHandler(async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;
    
    if(!await Compare({key: oldPassword, hashing: req.user.password})) {
        return next(new Error("Invalid old password", { cause: 401 }))
    }

    const hashedPassword = await Hash({key: newPassword, SALT_ROUNDS: process.env.SALT_ROUNDS})

    const user = await userModel.findByIdAndUpdate({_id: req.user._id}, {password: hashedPassword, passwordChangedAt: Date.now()})
    res.status(200).json({msg: "Done", user})
})

// --------------------------------------------- SHARE PROFILE --------------------------------------------------------------
export const shareProfile = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const user = await userModel.findById({ _id: id, isDeleted: false })
    if(!user) {
        return next(new Error("User doesn't exist", { cause: 404 }))
    }

    if (req.user._id.toString() === id) {
        return res.status(200).json({msg: "Done", user: req.user})
    }
    
    const emailViewed = user.viewers.find(viewer => { // checking if a viewer has viewed same account previously
        return viewer.userId.toString() === req.user._id.toString()
    })

    if(emailViewed) {
        emailViewed.time.push(Date.now())
        if(emailViewed.time.length > 5) {
            emailViewed.time = emailViewed.time.slice(-5)
        }
    } else {
        user.viewers.push({userId: req.user._id, time: [Date.now()]})
    }
    await user.save()

    res.status(200).json({msg: "Done", user})
})

// --------------------------------------------- UPDATE EMAIL ----------------------------------------------------------------
export const updateEmail = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    const user = await userModel.findOne({email})
    if(user) {
        return next(new Error("Email already exists", { cause: 409 }))
    }

    await userModel.updateOne({ _id: req.user._id }, { tempEmail: email })

    eventEmitter.emit("SendEmailConfirmation", { email: req.user.email, id: req.user._id })
    eventEmitter.emit("confirmNewEmail", { email, id: req.user._id })

    res.status(200).json({msg: "Done"})

})

// --------------------------------------------- REPLACE EMAIL ---------------------------------------------------------------
export const replaceEmail = asyncHandler(async (req, res, next) => {
    const { oldCode, newCode } = req.body;

    // const user = await userModel.findOne({ _id: req.user._id, isDeleted: false })
    // if(!req.user) {
    //     return next(new Error("User doesn't exist or deleted", { cause: 404 }))
    // }

    //it's already done in authentication

    if(!await Compare({key: oldCode, hashing: req.user.otpEmail})) {
        return next(new Error("Invalid old code", { cause: 401 }))
    }

    if(!await Compare({key: newCode, hashing: req.user.otpNewEmail})) {
        return next(new Error("Invalid new code", { cause: 401 }))
    }

    await userModel.updateOne(
        {_id: req.user._id},
        {
            email: req.user.tempEmail,
            $unset: {
                tempEmail: 0,
                otpEmail: 0,
                otpNewEmail: 0
            },
            passwordChangedAt: Date.now()
        })

    res.status(200).json({msg: "Done"})
})