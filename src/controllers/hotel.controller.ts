import HotelService from "../services/hotel.service.js";
import type { Request,Response } from "express";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import { IHotel } from "../interfaces/hotel.interface.js";


export async function createHotel(req:Request,res:Response) {
    try{
        const id = req.user?.id;
        if (!id) {
            return ApiResponse.error(res, "<<< Unauthorized >>>", 401);
        }
        const data:IHotel = req.body;

        const newHotel = await HotelService.createHotel(id,data)

        return ApiResponse.success(
            res, 
            newHotel, 
            "Hotel registration completed successfully.", 
            201 
        );
    }catch(err:any){

        if(err.message == "Account identifier is invalid or the record does not exist."){
            return ApiResponse.error(res,"<<< Not Found >>>",404,err.message)
        }

        if(err.message == "A hotel with this name already exists under your account."){
            return ApiResponse.error(res,"<<< Already Exists >>>",409,err.message)
        }

        if(err.message == "You do not have the required permissions to register a hotel."){
            return ApiResponse.error(res,"<<< Missing Permissions >>>",403,err.message)
        }

        if(err.message == "The specified owner does not exist."){
            return ApiResponse.error(res,"<<< Does Not Exist >>>",400,err.message)
        }
        return ApiResponse.error(res,"<<< Internal Server Error >>>",500,err.message)
    }
}

export async function updateHotelImage(req:Request,res:Response){
    try{

        if(!req.file || !req.file?.path){
            return ApiResponse.error(res,"<<< IMAGE NOT FOUND >>>",404)
        }
        
        const {hotelId} = req.params;
        if (typeof hotelId !== 'string') {
            return ApiResponse.error(res, "Invalid identifier format provided.", 400);
        }

        const filePath = req.file?.path


        const updatedHotel = await HotelService.updateHotelImage(hotelId,filePath as string)

        return ApiResponse.success(res,updatedHotel,"<<< Update Hotel Image Successful! >>>",200)
    }catch(err:any){
        if(err.message == "Hotel identifier is invalid or the record does not exist."){
            return ApiResponse.error(res,"<<< Invaild Request >>>",400,err.message)
        }

        return ApiResponse.error(res,"<<< Internal Server Error >>>",500,err.message)
    }
}

export async function getHotelDetailsById(req:Request,res:Response){
    try{
        const {hotelId} = req.params;
        if (typeof hotelId !== 'string') {
            return ApiResponse.error(res, "Invalid identifier format provided.", 400);
        }
        const hotel = await HotelService.getHotelDetailsById(hotelId)
        return ApiResponse.success(res,hotel,"<<< Successful Extract Hotel Data >>>",200)
    }catch(err:any){
        return ApiResponse.error(res,"<<< Internal Server Error >>>",500,err.message)
    }
}

export async function updateHotel(req:Request,res:Response){
    try{
        const {hotelId} = req.params;
        if (typeof hotelId !== 'string') {
            return ApiResponse.error(res, "Invalid identifier format provided.", 400);
        }
        const data:IHotel = req.body;
        const updatedHotel = await HotelService.updateHotel(hotelId,data)

        return ApiResponse.success(res,updatedHotel,"<<< Hotel Updated Successful!! >>>",200)
    }catch(err:any){
        if(err.message == ("Hotel identifier is invalid or the record does not exist.")){
            return ApiResponse.error(res,"<<< Invaild Request >>>",400,err.message)
        }
        return ApiResponse.error(res,"<<< Internal Server Error >>>",500,err.message)
    }
}

export async function searchHotel(req:Request,res:Response){
    try{
        const q = (req.query.q as string) || "";

        const searchedHotel = await HotelService.searchHotel(q)

        return ApiResponse.success(res,searchedHotel,"<<< Search Result >>>",200)
    }catch(err:any){
        return ApiResponse.error(res,"<<< Internal Server Error >>>",500,err.message)
    }
}

export async function deleteHotel(req:Request,res:Response){
    try{
        if(!req.user || !req.user.id){
            return ApiResponse.error(res,"<<< Unauthorized >>>",401)
        }
        const id = req.user?.id;
        const {hotelId} = req.params;

        if(typeof hotelId !== "string"){
            return ApiResponse.error(res,"<<< Invaild Hotel Id Format >>>",400);
        }

        const deletedHotel = await HotelService.deleteHotel(hotelId,id);
        return ApiResponse.success(res,deletedHotel,"<<< Delete Hotel Successful >>>",200)
    }catch(err:any){
        if(err.message === "Hotel Idenitifed is Invaild or not Found."){
            return ApiResponse.error(res,"<<< Invaild Request >>>",400,err.message)
        }
        if(err.message == "Owner Id is Invaild."){
            return ApiResponse.error(res,"<<< Invaild Request >>>",400,err.message)

        }
        return ApiResponse.error(res,"<<<Internal Server Error >>>",500,err.message)
    }
}

export async function getAllHotel(req:Request,res:Response) {
    try{
        const hotels = await HotelService.getAllHotels()
        return ApiResponse.success(res,hotels,"<<< Get Hotels Successful",200)
    }catch(err:any){
        return ApiResponse.error(res,"<<< Internal Server Error >>>",500,err.message)
    }
}

export async function mostRateHotel(req:Request,res:Response) {
    try{
        const hotels = await HotelService.mostRateHotels()
        return ApiResponse.success(res,hotels,"<<< Extract Hotels Successful",200)
    }catch(err:any){
        return ApiResponse.error(res,"<<< Internal Server Error >>>",500,err.message)
    }
}