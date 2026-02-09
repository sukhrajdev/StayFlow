import { v2 as cloudinary } from 'cloudinary';
import fs from "node:fs";

cloudinary.config({
        cloud_name: 'dmikmkm7c', 
        api_key: '229827921179977', 
        api_secret: 'ra8ofsSqtBR-YCsGWAInQm0vqhc' // Click 'View API Keys' above to copy your API secret
});
    
export async function uploadToCloduinary(path:string){
    try{
        const result = await cloudinary.uploader.upload(path);
        const imageUrl = cloudinary.url(result.public_id, {
        width: 500,
        height: 500,
        crop: 'fill',
        secure: true
        });
        await fs.promises.unlink(path);
        return imageUrl;
    }
    catch (err: any) {
        console.error(`Cloudinary Error: ${err.message}`);
        throw err; 
    } finally {
        try {
            if (fs.existsSync(path)) {
                await fs.promises.unlink(path);
                console.log(`Successfully removed local temp file: ${path}`);
            }
        } catch (unlinkErr) {
            console.error(`Failed to delete temp file: ${unlinkErr}`);
        }
    }
}



