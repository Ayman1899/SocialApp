import { checkDBconnection } from "./DB/DBconnection.js"
import cors from 'cors'
import { userRouter } from "./Modules/User/user.controller.js"
import { globalErrorHandling } from "./utils/error/index.js"
import path from 'path'
import { postRouter } from "./Modules/Post/post.controller.js"

export const bootstrap = async (app, express) => {
    
    app.use(cors())

    app.use('/uploads', express.static(path.resolve("src/uploads")))
    
    app.use(express.json())
    
    await checkDBconnection()

    app.get("/", (req, res) => res.status(200).json({msg: "Welcome to my SocialApp"}))

    app.use("/users", userRouter)
    app.use("/post", postRouter)

    app.use(/(.*)/, (req, res) => {
        return next(new Error(`Invalid URL => ${req.originalUrl}`))
    })

    app.use(globalErrorHandling)
}