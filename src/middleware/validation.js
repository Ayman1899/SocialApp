

export const validation = (schema) => {
    return (req, res, next) => {
        const inputData = {...req.body, ...req.params, ...req.query, ...(req.file && { file: req.file })}
        const result = schema.validate(inputData, { abortEarly: false })
        if(result?.error) {
            return res.status(400).json({msg: "Validation error:", error: result?.error.details})
        }
        next()
    }
}