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
        const userId = req.user.id;
        const user = await authService.getProfile(userId);
        return ApiResponse.success(res,user,"User profile get Successful.",200)
    }catch(err:any){
        return ApiResponse.error(res,"Internal Server error.",500,err.message)
    }
}