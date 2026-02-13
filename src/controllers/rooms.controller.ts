import RoomRepository from "../repository/rooms.repository.js";
import type { Request,Response } from "express";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import {IRoom} from "../interfaces/room.interface.js";

export async function createRoom(req:Request,res:Response) {
    try{
        if(!req.user || !req.user?.id){
            return ApiResponse.error(res,"<<< Unauthrozied: Please Login Again >>>",401)
        }
        const {id} = req.user
        const data:IRoom = req.body;
        const newRoom = await RoomRepository.createRoom(id,data)
        return ApiResponse.success(res,newRoom,"<<< Successful Created Room >>>",201)
    }catch(err:any){
        if(err.message == "<<< Hotel identifier is Invalid or not found. >>>"){
            return ApiResponse.error(res,"<<< Invaild Request >>>",400,err.message)
        }
        if(err.message == "<<< Unauthorized: You are not the owner of this Hotel >>>"){
            return ApiResponse.error(res,"<<< Unauthorized Request >>>",400,err.message)
        }
        return ApiResponse.error(res,"<<< Internal Server Error >>>",500,err.message)
    }
}

export async function updateRoomImage(req:Request,res:Response){
    try{
        if(!req.file || !req.file?.path){
            return ApiResponse.error(res,"<<< IMAGE NOT FOUND >>>",404)
        }
        const {roomId} = req.params;

        if(typeof roomId !== "string"){
            return ApiResponse.error(res,"<<< Invaild Room Id Type >>>",400)
        }

        const filePath = req.file.path;

        const updatedRoom = await RoomRepository.updateRoomImage(roomId,filePath)

        return ApiResponse.success(res,updatedRoom,"<<< Successful Room Image Update >>>",200)
    }catch(err:any){
        return ApiResponse.error(res,"<<< Internal Server Error >>>",500,err.message)
    }
}

// --- 1. Update Room Controller ---
export async function updateRoom(req: Request, res: Response) {
    try {
        const { roomId } = req.params;
        const data: IRoom = req.body; // Using your IRoom interface

        if (typeof roomId !== "string") {
            return ApiResponse.error(res, "<<< Invalid Room Id Type >>>", 400);
        }

        const updatedRoom = await RoomRepository.updateRoom(roomId, data);

        return ApiResponse.success(res, updatedRoom, "<<< Successfully Updated Room >>>", 200);
    } catch (err: any) {
        // This will catch the P2025 error your service throws
        if (err.message.includes("does not exist")) {
            return ApiResponse.error(res, "<<< Room Not Found >>>", 404, err.message);
        }
        return ApiResponse.error(res, "<<< Internal Server Error >>>", 500, err.message);
    }
}

// --- 2. Get Room By ID Controller ---
export async function getRoomById(req: Request, res: Response) {
    try {
        const { roomId } = req.params;

        if (typeof roomId !== "string") {
            return ApiResponse.error(res, "<<< Invalid Room Id Type >>>", 400);
        }

        const room = await RoomRepository.getRoomById(roomId);

        // Senior Null Check: Handle the null return from Prisma findUnique
        if (!room) {
            return ApiResponse.error(res, `<<< Room with ID ${roomId} not found >>>`, 404);
        }

        return ApiResponse.success(res, room, "<<< Successfully Fetched Room >>>", 200);
    } catch (err: any) {
        return ApiResponse.error(res, "<<< Internal Server Error >>>", 500, err.message);
    }
}


export async function getAllRooms(req: Request, res: Response) {
    try {
        // 1. Extract and parse pagination queries
        // If the user doesn't provide them in the URL, default to page 1 and limit 10
        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = parseInt(req.query.limit as string, 10) || 10;

        // 2. Prevent invalid inputs (like negative pages or limits of 0)
        const validPage = Math.max(1, page);
        const validLimit = Math.max(1, limit);

        // 3. Call the Repository / Service
        const paginatedData = await RoomRepository.getAllRooms(validPage, validLimit);

        // 4. Send the standardized response
        return ApiResponse.success(
            res, 
            paginatedData, 
            `<<< Successfully Fetched Rooms (Page ${validPage}) >>>`, 
            200
        );

    } catch (err: any) {
        return ApiResponse.error(res, "<<< Internal Server Error >>>", 500, err.message);
    }
}

// --- 3. Get Rooms By Hotel ID Controller ---
export async function getRoomsByHotelId(req: Request, res: Response) {
    try {
        const { hotelId } = req.params;

        if (typeof hotelId !== "string") {
            return ApiResponse.error(res, "<<< Invalid Hotel Id Type >>>", 400);
        }

        const rooms = await RoomRepository.getRoomsByHotelId(hotelId);

        // Array Check: findMany returns [] if no rooms exist
        if (rooms.length === 0) {
            return ApiResponse.success(res, rooms, `<<< No rooms found for Hotel ID ${hotelId} >>>`, 200); 
            // Note: Returning 200 with an empty array is RESTful standard for searches/filters
        }

        return ApiResponse.success(res, rooms, `<<< Successfully Fetched ${rooms.length} Rooms >>>`, 200);
    } catch (err: any) {
        return ApiResponse.error(res, "<<< Internal Server Error >>>", 500, err.message);
    }
}

export async function bookRoom(req: Request, res: Response) {
    try {
        if (!req.user || !req.user?.id) {
            return ApiResponse.error(res, "<<< Unauthorized: Please Login >>>", 401);
        }

        const userId = req.user.id;
        const { roomId } = req.params;

        if (typeof roomId !== "string") {
            return ApiResponse.error(res, "<<< Invalid Room Id Type >>>", 400);
        }

        const bookedRoom = await RoomRepository.bookRoom(userId, roomId);

        return ApiResponse.success(res, bookedRoom, "<<< Room Successfully Booked >>>", 200);
    } catch (err: any) {
        // Senior Status Code Routing
        if (err.message.includes("Only registered customers")) {
            return ApiResponse.error(res, "<<< Forbidden Request >>>", 403, err.message);
        }
        if (err.message.includes("already been booked")) {
            return ApiResponse.error(res, "<<< Conflict: Room Unavailable >>>", 409, err.message);
        }
        if (err.message.includes("does not exist")) {
            return ApiResponse.error(res, "<<< Room Not Found >>>", 404, err.message);
        }
        
        return ApiResponse.error(res, "<<< Internal Server Error >>>", 500, err.message);
    }
}

// --- 4. Delete Room Controller ---
export async function deleteRoom(req: Request, res: Response) {
    try {
        if (!req.user || !req.user?.id) {
            return ApiResponse.error(res, "<<< Unauthorized: Please Login >>>", 401);
        }

        const ownerId = req.user.id;
        const { roomId } = req.params;

        if (typeof roomId !== "string") {
            return ApiResponse.error(res, "<<< Invalid Room Id Type >>>", 400);
        }

        const result = await RoomRepository.deleteRoom(roomId, ownerId);

        return ApiResponse.success(res, null, result.message, 200);
    } catch (err: any) {
        if (err.message.includes("Unauthorized")) {
            return ApiResponse.error(res, "<<< Forbidden Request >>>", 403, err.message);
        }
        if (err.message.includes("not found")) {
            return ApiResponse.error(res, "<<< Room Not Found >>>", 404, err.message);
        }
        
        return ApiResponse.error(res, "<<< Internal Server Error >>>", 500, err.message);
    }
}