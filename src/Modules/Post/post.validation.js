import joi from 'joi'
import { generalRules } from '../../utils/generalRules/index.js'

export const createPostSchema = joi.object({
    content: joi.string().min(3).required(),
    files: joi.array().items(generalRules.file)
})