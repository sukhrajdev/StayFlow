import type { Request,Response,NextFunction } from "express";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import {prisma} from "../config/prisma.config.js";

export async function isAdmin(req:Request,res:Response,next:NextFunction){
    try{
        if(!req.user || !req.user?.id){
            return ApiResponse.error(res,"Unauthorized: No Id provided.",401)
        }
        const id = req.user?.id;
        const user = await prisma.user.findUnique({
            where: {
                id
            }
        })
        if(!user){
            return ApiResponse.error(res,"Invaild Id.")
        }
        if(user.role !== "ADMIN"){
            return ApiResponse.error(res,"Forbidden: Access Declined.",403)
        }
        next()
    }catch(err:any){
        return ApiResponse.error(res,"Internal Server Error: Forbidden",500,err.message)
    }
}

export async function isHotelOwner(req:Request,res:Response,next:NextFunction) {
    try{
        if(!req.user || !req.user?.id){
            return ApiResponse.error(res,"Unauthorized: No Id provided.",401)
        }
        const id = req.user?.id;
        const user = await prisma.user.findUnique({
            where: {
                id
            }
        })
        if(!user){
            return ApiResponse.error(res,"Invaild Id.")
        }
        if(user.role !== "HOTEL_OWNER"){
            return ApiResponse.error(res,"Forbidden: Access Declined.",403)
        }
        next()
    }catch(err:any){
        return ApiResponse.error(res,"Internal Server Error: Forbidden",500,err.message)
    }
}