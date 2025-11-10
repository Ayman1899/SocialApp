import { Router } from 'express'
import { validation } from '../../middleware/validation.js'
import * as UV from "./user.validation.js"
import * as US from "./user.service.js"
import { extentionTypes, multerHost } from '../../middleware/multer.js'
import { authentication } from '../../middleware/auth.js'
export const userRouter = Router()

userRouter.post("/signUp", multerHost(extentionTypes.image).single("profileImage")/* .array("coverImages", 3)/*.fields([
    {name: "profileImage", maxCount: 1},
    {name: "coverImages", maxCount: 3}    
])*//*multerLocal(...fileTypes.image, ...fileTypes.video*///multerLocal(extentionTypes.image, "Profile Images")/*.array("profileImage", 3)*/.fields([
    // {name: "profileImage", maxCount: 1},
    // {name: "coverImages", maxCount: 3}])
    /*validation(UV.signUpSchema)*/ , validation(UV.signUpSchema), US.signUp)
userRouter.patch("/confirmEmail", validation(UV.confirmEmailSchema), US.confirmEmail)
userRouter.post("/logIn", validation(UV.loginSchema), US.logIn)
userRouter.post("/loginWithGmail", US.loginWithGmail)
userRouter.get("/refreshToken", validation(UV.refreshTokenSchema), US.refreshToken)
userRouter.patch("/forgetPassword", validation(UV.forgetPasswordSchema), US.forgetPassword)
userRouter.patch("/resetPassword", validation(UV.resetPasswordSchema), US.resetPassword)
userRouter.patch("/updatePassword", validation(UV.updatePasswordSchema), authentication, US.updatePassword)
userRouter.patch("/updateEmail", validation(UV.updateEmailSchema), authentication, US.updateEmail)
userRouter.patch("/replaceEmail", validation(UV.replaceEmailSchema), authentication, US.replaceEmail)
userRouter.get("/profile/:id", validation(UV.shareProfileSchema), authentication, US.shareProfile)
userRouter.patch("/updateProfile",
    multerHost(extentionTypes.image).single("profileImage"), validation(UV.updateProfileSchema), authentication, US.updateProfile)