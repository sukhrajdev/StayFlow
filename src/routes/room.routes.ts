import express from "express";
import {
    createRoom,
    updateRoom,
    updateRoomImage,
    getAllRooms,
    getRoomById,
    getRoomsByHotelId,
    bookRoom,
    deleteRoom
} from "../controllers/rooms.controller.js";
import { JWT_middleware } from "../middlewares/auth.middleware.js";
import { isHotelOwner } from "../middlewares/role.middleware.js"; 
import { upload } from "../middlewares/multer.middleware.js";

const roomRoute = express.Router();


roomRoute.get("/", getAllRooms);


roomRoute.get("/hotel/:hotelId", getRoomsByHotelId);

// Get a single room's details
roomRoute.get("/:roomId", getRoomById);


roomRoute.post("/:roomId/book", 
    JWT_middleware, 
    bookRoom
);



roomRoute.post("/", 
    JWT_middleware, 
    createRoom
);

// Update room details (price, type, etc.)
roomRoute.patch("/:roomId", 
    JWT_middleware, 
    updateRoom
);

// Update room image
// Note: Role check happens BEFORE Multer processes the file to save server RAM!
roomRoute.patch("/:roomId/image",
    JWT_middleware,
    // isHotelOwner, <-- Add this if you have the middleware ready
    upload.single("roomIMG"), // Make sure your Postman key is exactly "roomIMG"
    updateRoomImage
);

// Delete a room
roomRoute.delete("/:roomId", 
    JWT_middleware, 
    deleteRoom
);

export default roomRoute;