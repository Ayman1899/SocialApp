import { Router } from 'express'
export const postRouter = Router();
import * as PS from './post.service.js'
import * as PV from './post.validation.js'
import { extentionTypes, multerHost } from '../../middleware/multer.js';
import { authentication } from '../../middleware/auth.js';
import { validation } from '../../middleware/validation.js';

postRouter.post("/create", 
    multerHost([...extentionTypes.audio, ...extentionTypes.image, ...extentionTypes.video, ...extentionTypes.pdf]).array("attachments", 5),
    validation(PV.createPostSchema), authentication, PS.createPost)