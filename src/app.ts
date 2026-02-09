import express from "express";
import type {NextFunction, Request,Response} from "express";
import authRoute from "./routes/auth.routes.js";
import userRoute from "./routes/user.routes.js";
import hotelRoute from "./routes/hotel.routes.js";
import cookieParser from "cookie-parser";
import "dotenv/config"
import { uploadToCloduinary } from "./utils/uploadToCloudinary.js";

const app = express()


app.use(express.json());
app.use(cookieParser())

app.use("/api/v1/auth",authRoute)
app.use("/api/v1/user",userRoute)
app.use("/api/v1/hotel",hotelRoute)

app.get('/',(req:Request,res:Response) => {
    res.send("Hello From StayFlow")
})


app.listen(3000,() => {
    console.log("Server was running at 3000");
})