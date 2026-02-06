import type { Request,Response,NextFunction } from "express";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import {prisma} from "../config/prisma.config.js";

export async function isActive(req: Request,res: Response,next: NextFunction){
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

        if(user.status == "SUSPENDED"){
            return ApiResponse.error(res,"Your Account has been Suspended.",403)
        }

        if(user.status == "BANNED"){
            return ApiResponse.error(res,"Your account has been Banned.",403)
        }
        next()
        
    }catch(err:any){
        return ApiResponse.error(res,"<<< Active Error: Internal Server Error >>>",500,err.message)
    }
}