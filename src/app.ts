import express from "express";
import type {Request,Response} from "express";
import authRoute from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import "dotenv/config"

const app = express()

app.use(express.json());
app.use(cookieParser())

app.use("/api/v1/auth",authRoute)

app.get('/',(req:Request,res:Response) => {
    res.send("Hello From StayFlow")
})

app.listen(3000,() => {
    console.log("Server was running at 3000");
})