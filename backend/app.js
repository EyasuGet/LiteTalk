import express from "express"
import authRoutes from "./routes/auth.routes.js"
import dotenv from "dotenv"
import connectDB from "./config/db.js"
import cookieParser from "cookie-parser"

dotenv.config()
const app = express()

//middleware
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())


//routes
app.use("/auth", authRoutes)

app.listen(8000, () => {
    console.log("server started on http://localhost:8000")
    connectDB()
})