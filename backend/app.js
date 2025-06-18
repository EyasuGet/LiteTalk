import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import { v2 as cloudinary} from "cloudinary"


import authRoutes from "./routes/auth.routes.js"
import userRoutes from "./routes/user.routes.js"
import postRoutes from "./routes/post.routes.js"

import connectDB from "./config/db.js"

dotenv.config()

cloudinary.config({
   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
   api_key: process.env.CLOUDINARY_API_KEY,
   api_secret: process.env.CLOUDINARY_API_SECRET
})

const app = express()

//middleware
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())


//routes
app.use("/auth", authRoutes)
app.use("/users", userRoutes)
app.use("/posts", postRoutes)

app.listen(8000, () => {
    console.log("server started on http://localhost:8000")
    connectDB()
})