import UserService from "../repository/user.repository.js";
import type { Request,Response } from "express";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import { ROLE } from "../generated/prisma/enums.js";

export async function updateUser(req: Request,res:Response){
    try{
        if(!req.user || !req.user.id){
            return ApiResponse.error(res,"Unauthorized");
        }
        const id = req.user?.id;
        const data = req.body;
        // Instead of data.length
        // Instead of data.length
        if (!data || Object.keys(data).length === 0) {
            return ApiResponse.error(res, "No data provided for update.", 400);
        }
        const updatedUser = await UserService.updateUser(id as string, data); // Pass the id and body
        return ApiResponse.success(res, updatedUser, "User updated successfully"); // Don't forget to return the response!
    }catch(err: any){
        if (err.code === 'P2025') {
            return ApiResponse.error(res,"<<< Error During Updating user >>>",404,err.message);
        }
        return ApiResponse.error(res,"<<< Internal Server Error >>>",500,err.message)
    }
}

export async function updateRoleById(req: Request, res: Response) {
    try {
        const { id, role } = req.body;

        // 1. Check for missing fields (Use 400 for bad request data, not 404)
        if (!id || !role) {
            return ApiResponse.error(res, "Role field is required.", 400);
        }

        // 2. Normalize and Validate Role
        const upperRole = role.toUpperCase();
        // Check if the normalized string exists in your ROLE enum
        if (!Object.values(ROLE).includes(upperRole)) {
            return ApiResponse.error(res, "Please provide a valid account role to proceed.", 400);
        }

        const updatedRole = await UserService.updateRoleById(id, upperRole as ROLE);

        return ApiResponse.success(res, updatedRole, "Role updated successfully!", 200);

    } catch (err: any) {
        console.log(err.message);
        
        // Handle specific repository errors
        const isKnownError = [
            "Account identifier is invalid or the record does not exist.",
            "Please provide a valid account role to proceed."
        ].includes(err.message);

        if (isKnownError) {
            return ApiResponse.error(res, err.message, 400);
        }

        return ApiResponse.error(res, "Internal Server Error", 500, err.message);
    }
}