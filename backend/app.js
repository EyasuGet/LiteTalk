import express from "express"
import authRoutes from "./routes/auth.routes.js"
import dotenv from "dotenv"
import connectDB from "./config/db.js"

dotenv.config()
const app = express()

app.use(express.json())
app.use("/api/auth", authRoutes)

app.listen(8000, () => {
    console.log("server started on http://localhost:8000")
    connectDB()
})