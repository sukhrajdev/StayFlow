import { uploadToCloduinary } from "../utils/uploadToCloudinary.js";
import {IRoom} from "../interfaces/room.interface.js"
import { prisma } from "../config/prisma.config.js";

class RoomRepository{
    public async createRoom(data:IRoom){
        try{
            const isExistingHotel = await prisma.hotel.findUnique({
                where: {
                    id:data.hotelId
                }
            })
            if(!isExistingHotel){
                throw new Error("<<< Hotel identifier is Invaild or not found. >>>")
            }
            return await prisma.room.create({
                data:{
                    roomNumber: data.roomNumber,
                    type: data.type,
                    price: data.price,
                    hotelId: data.hotelId
                }
            })
        }catch(err:any){
            throw new Error(err.message)
        }
    }
}