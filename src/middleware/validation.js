

export const validation = (schema) => {
    return (req, res, next) => {
        // spread ignores undefined safely ...(undefined) 
        const inputData = {...req.body, ...req.params, ...req.query, ...(req.file && { file: req.file }), ...(req.files && { files: req.files })}
        const result = schema.validate(inputData, { abortEarly: false })
        if(result?.error) {
            return res.status(400).json({msg: "Validation error:", error: result?.error.details})
        }
        next()
    }
}