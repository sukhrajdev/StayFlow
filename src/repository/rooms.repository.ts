import { uploadToCloduinary } from "../utils/uploadToCloudinary.js";
import {IRoom} from "../interfaces/room.interface.js";
import fs from "node:fs";
import { prisma } from "../config/prisma.config.js";

class RoomRepository{
    public async createRoom(ownerId: string, data: IRoom) {
    try {

        const hotel = await prisma.hotel.findUnique({
            where: { id: data.hotelId },
            select: { ownerId: true } 
        });


        if (!hotel) {
            throw new Error("<<< Hotel identifier is Invalid or not found. >>>");
        }


        if (hotel.ownerId !== ownerId) {
            throw new Error("<<< Unauthorized: You are not the owner of this Hotel >>>");
        }


        return await prisma.room.create({
            data: {
                roomNumber: data.roomNumber,
                type: data.type,
                price: data.price,
                hotelId: data.hotelId
            }
        });

    } catch (err: any) {

        if (err.code === 'P2002') {
            throw new Error(`<<< Room ${data.roomNumber} already exists in this hotel >>>`);
        }
        throw err; 
    }
}

    public async updateRoomImage(roomId: string,Path:string){
        try{
            const room = await prisma.room.findUnique({
                where: {
                    id:roomId
                }
            })
            

            if (!room) {
                fs.unlinkSync(Path); 
                throw new Error("<<< Room not found >>>");
            }


            let imageUrl = await uploadToCloduinary(Path)

            const updatedRoom = await prisma.room.update({
                where: {
                    id:roomId
                },
                data: {
                    image: imageUrl
                }
            })

            fs.unlinkSync(Path);
            return updatedRoom
        }catch(err:any){
            if (fs.existsSync(Path)) {
                fs.unlinkSync(Path);
            }
            throw err
        }
    }
}


export default new RoomRepository()