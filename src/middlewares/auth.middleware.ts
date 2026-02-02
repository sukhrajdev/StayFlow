// src/middlewares/auth.middleware.ts
import TOKEN_PROVIDER from "../providers/token.provider.js";
import type { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../utils/ApiResponse.utils.js";

export function JWT_middleware(req: Request, res: Response, next: NextFunction) {
    try {
        console.log("Cookies received:", req.cookies);
        const token = req.cookies.accessToken;

        if (!token) {
            return ApiResponse.error(res, "Unauthorized: No token provided.", 401);
        }

        const decoded = TOKEN_PROVIDER.verifyJwt(token, "ACCESS");

        req.user = decoded;
        
        next();
    } catch (err: any) {
        console.error(`Auth Middleware Error: ${err.message}`);
        return ApiResponse.error(res, "Unauthorized: Invalid or expired token.", 401);
    }
}