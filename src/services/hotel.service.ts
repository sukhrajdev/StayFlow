import { IHotel } from "../interfaces/hotel.interface.js";
import {prisma} from "../config/prisma.config.js";
import { uploadToCloduinary } from "../utils/uploadToCloudinary.js";

class HotelService{
    public async createHotel(ownerId:string,data:IHotel){
        try{
            const owner = await prisma.user.findUnique({
            where: { id: ownerId }
        });

        if (!owner) {
            throw new Error("The specified owner does not exist.");
        }

        if (owner.role !== 'ADMIN') {
            throw new Error("You do not have the required permissions to register a hotel.");
        }

        const existingHotel = await prisma.hotel.findFirst({
            where: { ownerId, name: { equals: data.name, mode: 'insensitive' }}
        });

        if (existingHotel) {
            throw new Error("A hotel with this name already exists under your account.");
        }

        return await prisma.hotel.create({
            data: { ...data, ownerId }
        });


        }catch(err:any){
            if(err.code == "P2025"){
                throw new Error("Account identifier is invalid or the record does not exist.")
            }
            throw new Error(err.message)
        }
    }

    public async updateHotelImage(hotelId:string,path:string){
        try{
            const imageUrl = await uploadToCloduinary(path)
            return await prisma.hotel.update({
                where:{
                    id:hotelId
                },
                data: {
                    imageUrl
                }
            })
            

        }catch(err:any){
            if(err.code == "P2025"){
                throw new Error("Hotel identifier is invalid or the record does not exist.")
            }
            throw new Error(err)
        }
    }
}

export default new HotelService()