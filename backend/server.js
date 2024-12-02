import express from "express"
import cors from 'cors'
import 'dotenv/config'
import connectDB from "./config/mongodb.js"
import connectCloudinary from "./config/cloudinary.js"
import userRouter from "./routes/userRoute.js"
import treatmentRouter from "./routes/treatmentRoute.js"
import adminRouter from "./routes/adminRoute.js"
import galleryRouter from "./routes/galleryRoute.js"
import teamRouter from "./routes/teamRoute.js"

// app config
const app = express()
const port = process.env.PORT || 4000
connectDB()
connectCloudinary()

// middlewares
app.use(express.json())
app.use(cors())

// api endpoints
app.use("/api/user", userRouter)
app.use("/api/admin", adminRouter)
app.use("/api/treatment", treatmentRouter)
app.use("/api/gallery", galleryRouter)
app.use("/api/team", teamRouter)

app.get("/", (req, res) => {
  res.send("API Working")
});

app.listen(port, () => console.log(`Server started on PORT:${port}`))
