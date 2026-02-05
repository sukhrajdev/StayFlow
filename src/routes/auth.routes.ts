import express from "express";
import {
    register,
    login,
    getProfile,
    logout,
    refreshAccessToken,
    forgetPassword
} from "../controllers/auth.controller.js"
import { JWT_middleware } from "../middlewares/auth.middleware.js";

const authRoute = express.Router()

authRoute.post("/register",register)
authRoute.post("/login",login)
authRoute.get("/me",JWT_middleware,getProfile)
authRoute.post("/logout",JWT_middleware,logout)
authRoute.post("/refresh-token",refreshAccessToken)
authRoute.post('/forget-password',JWT_middleware,forgetPassword)

export default authRoute