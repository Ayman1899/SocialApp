import { customAlphabet } from "nanoid";
import { EventEmitter } from "events"
import { Hash } from "../Encryption/index.js";
import { userModel } from "../../DB/Models/index.js";
import { sendEmail } from "../../services/sendEmail.service.js";
import { html } from "../../services/email-template.js";
export const eventEmitter = new EventEmitter()

eventEmitter.on("SendEmailConfirmation", async (data) => {
    const {email, id} = data;
    const otp = customAlphabet("1234567890", 6)();
    const hashedOtp = await Hash({key: otp, SALT_ROUNDS: process.env.SALT_ROUNDS})
    await userModel.updateOne({email, _id: id}, {otpEmail: hashedOtp})
    await sendEmail(email, "Confirm Email", html({ otp, message: "Email Confirmation" }))
})

eventEmitter.on("confirmNewEmail", async (data) => {
    const { email, id } = data;
    const otp = customAlphabet("123456789", 6)();
    const hashedOtp = await Hash({key: otp, SALT_ROUNDS: process.env.SALT_ROUNDS})
    await userModel.updateOne({ tempEmail: email, _id: id }, {otpNewEmail: hashedOtp})
    await sendEmail(email, "Confirm Email", html({ otp, message: "New Email Confirmation" }))
})

eventEmitter.on("ForgetPassword", async (data) => {
    const { email } = data;
    const otp = customAlphabet("0123456789", 6)()
    const hashedOtp = await Hash({key: otp, SALT_ROUNDS: process.env.SALT_ROUNDS})
    await userModel.updateOne({email}, {otpForgetPassword: hashedOtp})
    await sendEmail(email, "Forget Password", html({ otp, message: "Forget Password" }))
})