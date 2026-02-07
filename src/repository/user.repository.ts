import { prisma } from "../config/prisma.config.js";
import { IUserUpdate } from "../interfaces/user.interface.js";
import { ROLE } from "../generated/prisma/enums.js";
import { userStatus } from "../types/user.types.js";

class UserService {
    async updateUser(id: string, data: IUserUpdate) {

        try {
            const updatedUser = await prisma.user.update({
                where: { id },
                data: {
                    ...(data.username && { username: data.username }),
                    ...(data.email && { email: data.email }),
                },
                select: {
                    username: true,
                    email: true,
                    isVerified: true,
                    role: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                }
            })

            return updatedUser
        } catch (error) {
            throw new Error("Invalid User ID. User not found.")
        }
    }

    async updateRoleById(id: string,role: ROLE){
        try{
            const user = await prisma.user.findUnique({
                where: {
                    id
                },
                select: {
                    username: true,
                    email: true,
                    isVerified: true,
                    role: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true
                }
            })
            if(!user){
                throw new Error("Account identifier is invalid or the record does not exist.")
            }

            if(!role){
                throw new Error("Please provide a valid account role to proceed.")
            }

            return await prisma.user.update({
                where: {
                    id
                },
                data: {
                    role: role
                },
                select: {
                    username: true,
                    email: true,
                    isVerified: true,
                    role: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true
                }
            })
        } catch (error) {
            throw new Error("Failed to update user role.")
        }
    }
               
    async ChangeStatusById(id: string,status: userStatus){
        try{

        return await prisma.user.update({
            where: {
                id
            },
            data: {
                status
            },
            select: {
                id: true,
                username: true,
                email: true,
                isVerified: true,
                role: true,
                status: true,
                createdAt: true,
            }
        })
        }catch(err:any){
            if(err.code == "P2025"){
                throw new Error("Account identifier is invalid or the record does not exist.")
            }
                throw err;

        }
    }

    async getAllUsers(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
        prisma.user.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            select: { id: true, username: true, email: true, role: true }
        }),
        prisma.user.count()
    ]);
    return { users, total, totalPages: Math.ceil(total / limit) };
    }

    async searchUsers(query: string) {
    return await prisma.user.findMany({
        where: {
            OR: [
                { username: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } }
            ]
        }
    });
    }
}

export default new UserService();