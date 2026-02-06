import express from "express";
import {
    updateUser,
    updateRoleById
} from "../controllers/user.controller.js";
import { JWT_middleware } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";
import { isActive } from "../middlewares/status.middleware.js";
const userRoute = express.Router()

userRoute.put('/',JWT_middleware,isActive,updateUser)
userRoute.patch('/:id/role/',
    JWT_middleware,
    isAdmin,
    isActive,
    updateRoleById)

export default userRoute