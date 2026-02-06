import express from "express";
import {
    register,
    login,
    getProfile,
    logout,
    refreshAccessToken,
    forgetPassword,
    deleteUserById
} from "../controllers/auth.controller.js"
import { JWT_middleware } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";
import { isActive } from "../middlewares/status.middleware.js";


const authRoute = express.Router()

authRoute.post("/register",register)
authRoute.post("/login",login)
authRoute.get("/me",JWT_middleware,isActive,getProfile)
authRoute.post("/logout",JWT_middleware,logout)
authRoute.post("/refresh-token",isActive,refreshAccessToken)
authRoute.post('/forget-password',JWT_middleware,isActive,forgetPassword)
authRoute.delete('/',
    JWT_middleware,
    isAdmin,
    isActive,
    deleteUserById)

export default authRoute