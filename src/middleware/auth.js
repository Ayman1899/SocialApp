import { userModel } from "../DB/Models/user.model.js";
import { asyncHandler } from "../utils/error/index.js";
import { verifyToken } from "../utils/Token/index.js";

export const tokenTypes = {
    access: "Access",
    refresh: "Refresh"
}

export const decodedToken = async ({ authorization, tokenType, next }) => {

    const [prefix, token] = authorization.split(" ") || []
    if (!prefix || !token) {
        return next(new Error("Token not found", {cause: 400}))
    }
    
    let ACCESS_SIGNATURE = undefined;
    let REFRESH_SIGNATURE = undefined;
    if (prefix == process.env.ADMIN_TOKEN_PREFIX) {
        ACCESS_SIGNATURE = process.env.ADMIN_ACCESS_SIGNATURE
        REFRESH_SIGNATURE = process.env.ADMIN_REFRESH_SIGNATURE
    }
    else if (prefix == process.env.USER_TOKEN_PREFIX) {
        ACCESS_SIGNATURE = process.env.USER_ACCESS_SIGNATURE
        REFRESH_SIGNATURE = process.env.USER_REFRESH_SIGNATURE
    }
    else {
        return next(new Error("Invalid Token prefix", {cause: 400}))
    }

    const decoded = await verifyToken({
        token,
        SIGNATURE: tokenType === tokenTypes.access ? ACCESS_SIGNATURE : REFRESH_SIGNATURE
    })
    
    if(!decoded?.id) {
        return next(new Error("Invalid Token payload", {cause: 400}))
    }
    const user = await userModel.findOne({ _id: decoded.id, isDeleted: false}).lean()
    if (!user) {
        return next(new Error("User not found or deleted", {cause: 400}))
    }
    
    if(parseInt(user?.passwordChangedAt?.getTime() / 1000) >= decoded.iat) {
        return next(new Error("Token expired", { cause: 401 }))
    }
    return user;
}

export const authentication = asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers;
    const user = await decodedToken({authorization, tokenType: tokenTypes.access, next})
    req.user = user
    next()
})




export const authorization = (accessRoles = []) => {
    return asyncHandler((req, res, next) => {
        if (!accessRoles == req.user.role) {
            return next(new Error("Access Denied", {cause: 400}))
        }
        next()
    })
}