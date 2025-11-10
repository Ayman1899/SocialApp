import mongoose from 'mongoose'
export const checkDBconnection = async () => {
    await mongoose.connect(process.env.URL)
    .then(()=> console.log("Database connected"))
    .catch(()=> console.log("Database failed to connect"))
}