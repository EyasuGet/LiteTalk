import mongoose from "mongoose";

const connectDB = async () =>{
    try {
        const connection = await mongoose.connect(process.env.MONGO_URL)
        console.log("Database connected!!!")
    } catch (error) {
        console.log(`error connecting the database ${error.message}`)
    }
}

export default connectDB