import { prisma } from "../config/prisma.config.js";
import { IRegisterInput,ILoginInput } from "../interfaces/auth.interface.js";
import { IForgetPassword } from "../interfaces/user.interface.js";
import TOKEN_PROVIDER from "../providers/token.provider.js";
import bcrypt from "bcrypt";
import { Response } from "express";

class AuthService {
    async register(data: IRegisterInput) {

        const isExisting = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (isExisting) {
            throw new Error("User already exists");
        }


        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.password, salt);


        return await prisma.user.create({
            data: {
                username: data.username,
                email: data.email,
                password: hashedPassword,
            },
            select: {
                username: true,
                email: true,
                isVerified: true,
                role: true,
                status: true,
                createdAt: true,
                updatedAt:true
            }
        });
    }

    async login(data: ILoginInput){
        let user = await prisma.user.findUnique({
            where: {
                email: data.email
            }
        })
        if(!user){
            throw new Error("User does not exist.")
        }
        const isMatchPassword = await bcrypt.compare(data.password,user.password)
        if(!isMatchPassword){
            throw new Error("Invalid credentials!")
        }
        const refreshToken = TOKEN_PROVIDER.generateRefreshToken(user.id);
        const accessToken = TOKEN_PROVIDER.generateAccessToken(user.id);
        user = await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                refreshToken
            }
        })
        const {password, ...userWithoutPassword} = user
        return {
        user: userWithoutPassword,
        accessToken,
        refreshToken
    };
    }

    async getProfile(userId: string) {
        return await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                isVerified: true
            }
        });
    }

    async refreshAccessToken(refreshToken: string) {
        try {
            const decoded = TOKEN_PROVIDER.verifyJwt(refreshToken, "REFRESH");
        
            const accessToken = TOKEN_PROVIDER.generateAccessToken(decoded.id);
        
            return { accessToken };
            } catch (err: any) {
            throw new Error("Invalid or expired refresh token.");
        }
    }

    async logout(res: Response) {

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        return { message: "Logged out successfully" };
    }

    async forgetPassword(id: string, data: IForgetPassword) {
    try {
        if (data.newPassword.length < 8) {
            throw new Error("New Password is Weak.");
        }

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new Error("Invalid User ID. User not found.");
        }

        const isMatchPassword = await bcrypt.compare(data.oldPassword, user.password);
        if (!isMatchPassword) {
            throw new Error("Incorrect Password!.");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.newPassword, salt);

        return await prisma.user.update({
            where: { id },
            data: { password: hashedPassword },
            select: {
                username: true,
                email: true,
                updatedAt: true
            }
        });

    } catch (err: any) {

        if (err.code === 'P2025') {
            throw new Error("Invalid User ID. User not found.");
        }
        throw err;
    }
    }

}

export default new AuthService();