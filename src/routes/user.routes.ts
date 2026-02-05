import express from "express";
import {
    updateUser,
    updateRoleById
} from "../controllers/user.controller.js";
import { JWT_middleware } from "../middlewares/auth.middleware.js";

const userRoute = express.Router()

userRoute.put('/',JWT_middleware,updateUser)
userRoute.put('/',JWT_middleware,updateRoleById)

export default userRoute