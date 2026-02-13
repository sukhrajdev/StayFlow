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

    public async updateRoom(roomId:string,data:IRoom){
        try{
            const updatedRoom = await prisma.room.update({
                where: {
                    id:roomId
                },
                data: {
                    ...(data.price && {price:data.price}),
                    ...(data.type && {type:data.type})
                }
            })
            return updatedRoom
        }catch(err:any){
            if (err.code === 'P2025') {
                throw new Error(`<<< Room with ID ${roomId} does not exist. >>>`);
        }
            throw err; 
        }
    }

    public async getRoomById(roomId:string){
        try{
            const room = await prisma.room.findUnique({where:{id:roomId}})
            return room
        }catch(err:any){
            if (err.code === 'P2025') {
            throw new Error(`<<< Room with ID ${roomId} does not exist. >>>`);
        }
        throw err; 
        }
    }

    public async getRoomsByHotelId(hotelId:string){
        try{
            const room = await prisma.room.findMany({where:{hotelId}})
            return room
        }catch(err:any){
            if (err.code === 'P2025') {
                throw new Error(`<<< Room with hotel Id ${hotelId} does not exist. >>>`);
            }
            throw err
        }
    }

    // Add page and limit parameters with default values
    public async getAllRooms(page: number = 1, limit: number = 10) {
        try {
            // Calculate how many records to skip
            const skip = (page - 1) * limit;

            const [rooms, totalRooms] = await prisma.$transaction([
                // 1. Get the paginated rooms
                prisma.room.findMany({
                    skip: skip,
                    take: limit,
                    orderBy: {
                        createdAt: 'desc' // Newest rooms first
                    }
                }),
                // 2. Get the total count for the frontend to build page numbers
                prisma.room.count()
            ]);

            return {
                rooms,
                meta: {
                    total: totalRooms,
                    page,
                    limit,
                    totalPages: Math.ceil(totalRooms / limit)
                }
            };
        } catch (err: any) {
            throw new Error(`<<< Failed to fetch rooms: ${err.message} >>>`);
        }
    }

    public async bookRoom(userId: string, roomId: string) { // Pro-tip: Action verbs for methods (bookRoom instead of bookedRoom)
        try {
            // 1. Optimization: Fetch ONLY the role, not the entire user object
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { role: true } 
            });

            // 2. The Filled-In Error Messages
            if (!user) {
                throw new Error("<<< Authentication Failed: User not found. >>>");
            }
            
            if (user.role !== "CUSTOMER") {
                throw new Error("<<< Unauthorized: Only registered customers can book rooms. >>>");
            }

            // 3. Senior Move: Prevent Double Booking
            // Check the current status of the room before updating it
            const roomStatus = await prisma.room.findUnique({
                where: { id: roomId },
                select: { isBooked: true }
            });

            // If findUnique returns null, the room doesn't exist
            if (!roomStatus) {
                throw new Error(`<<< Room with ID ${roomId} does not exist. >>>`);
            }

            // If it's already booked, stop the process immediately!
            if (roomStatus.isBooked) {
                throw new Error("<<< Conflict: This room has already been booked by another user. >>>");
            }

            // 4. Securely book the room now that we know it's available
            const room = await prisma.room.update({
                where: { id: roomId },
                data: { isBooked: true }
            });

            return room;

        } catch (err: any) {
            // We can keep this just in case a concurrent deletion happens 
            // a millisecond before the update executes
            if (err.code === 'P2025') {
                throw new Error(`<<< Operation Failed: Room with ID ${roomId} could not be updated. >>>`);
            }
            throw err;
        }
    }

    public async deleteRoom(roomId: string, ownerId: string) {
        try {
            // 1. Fetch the room, its image, AND the hotel's owner ID in one fast query
            const room = await prisma.room.findUnique({
                where: { id: roomId },
                select: { 
                    image: true,       // We need this to clean up Cloudinary later
                    hotel: {
                        select: { ownerId: true } // Fetching relational data efficiently
                    }
                }
            });

            // 2. Existence Check
            if (!room) {
                throw new Error(`<<< Room with ID ${roomId} not found. >>>`);
            }

            // 3. Security Check: Is the requester the actual owner?
            if (room.hotel.ownerId !== ownerId) {
                throw new Error("<<< Unauthorized: You do not own the hotel this room belongs to. >>>");
            }

            // 4. Clean up Cloudinary Storage (Senior Move)
            // If you don't do this, your Cloudinary account will fill up with deleted room photos!
            if (room.image) {
                // await deleteFromCloudinary(room.image); 
            }

            // 5. Safely Delete the Database Record
            await prisma.room.delete({
                where: { id: roomId }
            });

            return { message: "<<< Room successfully deleted. >>>" };

        } catch (err: any) {
            // Catch any unexpected Prisma errors
            throw new Error(`<<< Deletion Failed: ${err.message} >>>`);
        }
    }
}


export default new RoomRepository()