import { prisma } from "../config/prisma.config.js";
import bcrypt from "bcrypt"
import { IForgetPassword, IUserUpdate } from "../interfaces/user.interface.js";

class UserService {
    public async updateUser(id: string, data: IUserUpdate) {

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
    public async forgetPassword(id: string,data: IForgetPassword){
        try{
            const user = await prisma.user.findUnique({
                where: {
                    id
                }
            })
            const isMatchPassword = await bcrypt.compare(data.oldPassword,user?.password)
            if(!isMatchPassword){
                throw new Error("Incorrect Password!.")
            }
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(data.newPassword, salt);
            return await prisma.user.update({
                where: {
                    id
                },
                data: {
                    password: hashedPassword
                }
            })
        }catch(err: any){
            throw new Error("Invalid User ID or User not found.")
        }
    }
}

export default UserService;