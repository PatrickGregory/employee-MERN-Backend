import express from "express";
import dotenv from "dotenv"
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import {UserRouter} from "./routes/route.js";

dotenv.config()

const app = express()
// app.use(cors())
app.use(express.json())
app.use(cors({
    origin:['http://localhost:3000'],
    credentials:true,
    optionsSuccessStatus:200
}))
app.use(cookieParser())
app.use('/auth', UserRouter)



mongoose.connect('mongodb://localhost:27017/authentication')

app.listen(process.env.PORT, ()=>{
    console.log("Server is running")
})