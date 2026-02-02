import authService from "../services/auth.service.js";
import type { Request,Response } from "express";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
export async function register(req:Request, res:Response) {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return ApiResponse.error(res, "Required fields are not Provide.", 400)
        }
        if (username.length < 3) {
            return ApiResponse.error(res, "Username is minmum Length 3", 400)
        }
        if (!email.endsWith("@gmail.com")) {
            return ApiResponse.error(res, "Email is Invaild.", 400)
        }
        if (password.length < 8) {
            return ApiResponse.error(res, "Password is Weak", 400)
        }
        const createdUser = await authService.register({username,email,password})
        return ApiResponse.success(res,createdUser,"User created successful!.",201)
    }catch(err:any){
        console.log(err.message);
        
        if (err.message === "User already exists") {
            return ApiResponse.error(res, err.message, 409);
        }

        return ApiResponse.error(res, "Something went wrong on our end.", 500);
    }
}

export async function login(req:Request, res:Response) {
    try{
        const {email,password} = req.body;
        if(!email && !password){
            return ApiResponse.error(res,"Required fields are not Provide.",400)
        }
        const { user, accessToken, refreshToken } = await authService.login({email,password})
        
        res.cookie("accessToken", accessToken, {
            httpOnly: true,    
            secure: process.env.NODE_ENV === "production", // Only over HTTPS in prod
            sameSite: "strict", // Protects against CSRF
            maxAge: 24 * 60 * 60 * 1000 
        });


        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        
        return ApiResponse.success(res,user,"Login successful!",200)
    }catch(err:any){
        console.log(err.message);
        
        if(err.message === "User does not exist."){
            return ApiResponse.error(res,err.message,404)
        }

        if (err.message === "Invalid credentials!") {
            return ApiResponse.error(res, err.message, 401);
        }

        console.error("Login Error:", err.message);
        return ApiResponse.error(res, "Internal Server Error.", 500);
    }
}

export async function getProfile(req:Request,res:Response) {
    try{
        if(!req.user || !req.user.id){
            return ApiResponse.error(res,"Unauthorized");
        }

        const userId = req.user.id;
        const user = await authService.getProfile(userId);
        return ApiResponse.success(res,user,"User profile get Successful.",200)
    }catch(err:any){
        return ApiResponse.error(res,"Internal Server error.",500,err.message)
    }
}

export async function logout(req:Request,res:Response){
    authService.logout(res)
    return ApiResponse.success(res,{},"Logout Successful!",200)
}

export async function refreshAccessToken(req: Request, res: Response) {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return ApiResponse.error(res, "Refresh token missing", 401);
        }

        const result = await authService.refreshAccessToken(refreshToken);

        if (!result || !result.accessToken) {
            return ApiResponse.error(res, "Could not refresh token", 401);
        }


        res.cookie("accessToken", result.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        return ApiResponse.success(res, null, "Token refreshed successfully", 200);

    } catch (err: any) {
        console.error("Refresh Token Error:", err.message);
        return ApiResponse.error(res, "Session expired, please login again.", 401);
    }
}