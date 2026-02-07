import UserService from "../repository/user.repository.js";
import type { Request,Response } from "express";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import { ROLE, STATUS } from "../generated/prisma/enums.js";

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
        const {id} = req.params
        const { role } = req.body;

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

        const updatedRole = await UserService.updateRoleById(id as string, upperRole as ROLE);

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

export async function UpdateStatusById(req:Request,res:Response){
    try{
        const {id} = req.params
        if(!id){
            return ApiResponse.error(res,"The operation could not be completed because the identifier was not specified.",404)
        }
        if (typeof id !== 'string') {
            return ApiResponse.error(res, "Invalid identifier format.", 400);
        }
        const {status} = req.body;
        if(!status){
            return ApiResponse.error(res,"Missing required field: status.",404)
        }



        const newStatus:string = status.toUpperCase();

        if (!Object.values(STATUS).includes(newStatus as any)) {
            throw new Error("The provided account status is invalid.");
        }

        const updatedUser = await UserService.ChangeStatusById(id,newStatus as any)

        return ApiResponse.success(res, updatedUser, "Account status updated successfully.",200);
    }catch(err:any){
        return ApiResponse.error(res,"<<< Internal Server Error >>>",400,err.message)
    }
}

export async function searchUsers(req: Request, res: Response) {
    try {
        const { q } = req.query;

        if (!q || typeof q !== 'string') {
            return ApiResponse.error(res, "Search query parameter 'q' is required.", 400);
        }

        const users = await UserService.searchUsers(q);

        return ApiResponse.success(
            res, 
            users, 
            `Found ${users.length} users matching your search.`, 
            200
        );

    } catch (err: any) {
        return ApiResponse.error(res, "Search operation failed.", 500, err.message);
    }
}

export async function getAllUsers(req:Request,res:Response){
    try{
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        // 2. Validation: Ensure numbers are positive
        if (page < 1 || limit < 1) {
            return ApiResponse.error(res, "Pagination parameters must be positive integers.", 400);
        }
        const result = await UserService.getAllUsers(page,limit);

        if (result.users.length === 0) {
            return ApiResponse.success(res, [], "No users found matching your criteria.", 200);
        }
        return ApiResponse.success(res,result.users,"<<< User Extract Successful >>>",200)
    }catch(err:any){
        return ApiResponse.error(res,"<<< Internal Server Error >>>",500,err.message)
    }
}