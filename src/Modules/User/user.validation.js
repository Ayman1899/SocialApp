import joi from "joi"
import { generalRules } from "../../utils/generalRules/index.js"
import { genderTypes } from "../../DB/Models/user.model.js"

export const signUpSchema = joi.object({
    name: joi.string().alphanum().min(3).max(30).required(),
    email: generalRules.email.required(),
    password: generalRules.password.required(),
    cPassword: generalRules.password.valid(joi.ref("password")).required(),
    phone: joi.string().regex(/^(\+201|01|00201)[0-2,5]{1}[0-9]{8}/).required(),
    gender: joi.string().valid(genderTypes.male, genderTypes.female).required(),
    file: generalRules.file
})

export const confirmEmailSchema = joi.object({
    email: generalRules.email.required(),
    code: joi.string().length(6).required()
})

export const updateEmailSchema = joi.object({
    email: generalRules.email.required(),
})

export const replaceEmailSchema = joi.object({
    oldCode: joi.string().length(6).required(),
    newCode: joi.string().length(6).required()
})

export const loginSchema = joi.object({
    email: generalRules.email.required(),
    password: generalRules.password.required()
})

export const refreshTokenSchema = joi.object({
    authorization: joi.string().required()
})

export const forgetPasswordSchema = joi.object({
    email: generalRules.email.required()
})

export const resetPasswordSchema = joi.object({
    email: generalRules.email.required(),
    code: joi.string().length(6).required(),
    newPassword: generalRules.password.required(),
    cPassword: generalRules.password.valid(joi.ref("newPassword")).required()
})

export const updateProfileSchema = joi.object({
    name: joi.string().alphanum().min(3).max(30),
    phone: joi.string().regex(/^(\+201|01|00201)[0-2,5]{1}[0-9]{8}/),
    gender: joi.string().valid(genderTypes.male, genderTypes.female),
    file: generalRules.file
})

export const updatePasswordSchema = joi.object({
    oldPassword: generalRules.password.required(),
    newPassword: generalRules.password.required(),
    cPassword: generalRules.password.valid(joi.ref("newPassword")).required()
})

export const shareProfileSchema = joi.object({
    id: joi.string().required()
})