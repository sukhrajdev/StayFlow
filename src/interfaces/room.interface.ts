import { RoomType } from "../generated/prisma/enums.js";

export interface IRoom {
    roomNumber: number;    
    type: RoomType;        
    price: number;         
    hotelId: string;       
    image?: string;        
}