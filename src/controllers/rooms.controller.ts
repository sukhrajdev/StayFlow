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