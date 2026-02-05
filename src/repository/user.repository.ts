import { prisma } from "../config/prisma.config.js";
import { IUserUpdate } from "../interfaces/user.interface.js";
import { ROLE } from "../generated/prisma/enums.js";

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
                                                                      
}

export default new UserService();