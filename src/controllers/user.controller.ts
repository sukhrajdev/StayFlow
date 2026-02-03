import UserService from "../repository/user.repository.js";
import type { Request,Response } from "express";
import { ApiResponse } from "../utils/ApiResponse.utils.js";

export async function updateUser(req: Request,res:Response){
    try{
        if(!req.user || !req.user.id){
            return ApiResponse.error(res,"Unauthorized");
        }
        const id = req.user?.id;
        const data = req.body;
        if(!data || data.length === 0){
            return ApiResponse.error(res,"Required fields are not provide.",400)
        }
        const updatedUser = await UserService.updateUser()
    }catch(err: any){
        if(err.message == "Invalid User ID. User not found."){
            return ApiResponse.error(res,"<<< Invaild Id >>>",401,err.message)
        }
        return ApiResponse.error(res,"<<< Internal Server Error >>>",500,err.message)
    }
}