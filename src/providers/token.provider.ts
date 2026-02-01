import jwt from "jsonwebtoken"

class TOKEN_PROVIDER {
    // 1. Generate Access Token (Short lived - 1d)
    generateAccessToken(userId:number){
        if(!userId){
            throw new Error("User id is not provide.")
        }
        return jwt.sign(
            { id: userId },
                (process.env.JWT_ACCESS_TOKEN_SECRET as string) || "58e8fa94488a515b3ff13b3037b344d9", 
            { 
              expiresIn: (process.env.JWT_ACCESS_TOKEN_EXPIRY as any) || "1d"
            }
        );
    }

    // 2. Generate Refresh Token (Long lived - 7d)
    generateRefreshToken(userId:number){
        if(!userId){
            throw new Error("User id is not provide.")
        }
        return jwt.sign({
            id: userId
        },
        (process.env.REFRESH_TOKEN_SECRET as string) || "c80e76f2b7bad48d7f0e6ffab2eb65d0",
        {expiresIn: (process.env.REFRESH_TOKEN_EXPIRY as any) || "7d"}
    )
    }

    verifyJwt(token: string,secretType: 'ACCESS' | 'REFRESH'){
        try {
            const secret = secretType === "ACCESS" 
                ? process.env.JWT_ACCESS_TOKEN_SECRET 
                : process.env.JWT_REFRESH_TOKEN_SECRET;

            if (!secret) throw new Error("JWT Secret is missing in .env");

            return jwt.verify(token, secret) as { id: string, role: string };
            
        } catch (error: any) {

            if (error.name === "TokenExpiredError") {
                throw new Error("Token has expired. Please log in again.");
            }
            throw new Error("Invalid token.");
        }
    }
}

export  default new TOKEN_PROVIDER