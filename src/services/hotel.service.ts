import { IHotel } from "../interfaces/hotel.interface.js";
import {prisma} from "../config/prisma.config.js";
import { uploadToCloduinary } from "../utils/uploadToCloudinary.js";

class HotelService{
    public async createHotel(ownerId:string,data:IHotel){
        try{
            const owner = await prisma.user.findUnique({
            where: { id: ownerId },
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
                },
                select: {
                id: true,
                name: true,
                description: true,
                location: true,
                city: true,
                rating: true,
                contactEmail: true,
                contactPhone: true,
                imageUrl: true,
                ownerId: true,
                rooms: true,
                updatedAt: true
            }
            })
            

        }catch(err:any){
            if(err.code == "P2025"){
                throw new Error("Hotel identifier is invalid or the record does not exist.")
            }
            throw new Error(err)
        }
    }

    public async getHotelDetailsById(hotelId:string){
        return await prisma.hotel.findUnique({
            where: {id:hotelId},
            select: {
                id: true,
                name: true,
                description: true,
                location: true,
                city: true,
                rating: true,
                contactEmail: true,
                contactPhone: true,
                imageUrl: true,
                ownerId: true,
                rooms: true,
                createdAt: true
            }
        })
    }

    public async updateHotel(hotelId:string,data:IHotel){
        try{
        const updatedHotel = await prisma.hotel.update(
            {
                where: {id: hotelId},
                data: {
                    ...(data.name && {name: data.name}),
                    ...(data.description && {description: data.description}),
                    ...(data.location && {location: data.location}),
                    ...(data.city && {city: data.city}),
                    ...(data.contactEmail && {city: data.contactEmail}),
                    ...(data.contactPhone && {city: data.contactPhone})
                },
                select: {
                id: true,
                name: true,
                description: true,
                location: true,
                city: true,
                rating: true,
                contactEmail: true,
                contactPhone: true,
                imageUrl: true,
                ownerId: true,
                rooms: true,
                updatedAt: true
            }
            }
            
        )
        return updatedHotel
    }catch(err:any){
        if(err.code == "P2025"){
                throw new Error("Hotel identifier is invalid or the record does not exist.")
        }
        throw err;
    }
    }


    public async searchHotel(query:string){
        return await prisma.hotel.findMany({
            where: {
                OR: [
                    {name: {contains: query, mode:'insensitive'}},
                    {city: {contains: query, mode:'insensitive'}},
                    {location: {contains: query, mode:'insensitive'}}
                ]
            },
            select: {
                id: true,
                name: true,
                description: true,
                location: true,
                city: true,
                rating: true,
                contactEmail: true,
                contactPhone: true,
                imageUrl: true,
                ownerId: true,
                rooms: true,
                createdAt: true
            }

        })
    }

    public async deleteHotel(hotelId:string,ownerId:string){
        try{
        const hotel = await prisma.hotel.findUnique({
            where: {
                id:hotelId
            }
        })
        if(!hotel){
            throw new Error("Hotel Idenitifed is Invaild or not Found.")
        }
        if(hotel.ownerId !== ownerId){
            throw new Error("Owner Id is Invaild.")
        }
        return hotel
    }catch(err:any){
        throw new Error(err.message)
    }
    }

    public async getAllHotels(){
        try{
            return await prisma.hotel.findMany();
        }catch(err:any){
            throw new Error(err.message)
        }
    }

}

export default new HotelService()