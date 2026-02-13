import express from "express";
import {
    createHotel,
    updateHotelImage,
    getHotelDetailsById,
    updateHotel,
    searchHotel,
    getAllHotel,
    deleteHotel,
    mostRateHotel
} from "../controllers/hotel.controller.js";
import { JWT_middleware } from "../middlewares/auth.middleware.js";
import {  isHotelOwner } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const hotelRoute = express.Router();

// =======================================================
// 1. STATIC & PUBLIC ROUTES (MUST BE AT THE TOP)
// =======================================================
// If these are below /:id, Express will think "search" or "top-rated" are IDs!
hotelRoute.get("/search", searchHotel);
hotelRoute.get("/top-rated", mostRateHotel);
hotelRoute.get("/", getAllHotel); // Paginated list of all hotels

// =======================================================
// 2. CREATION ROUTE (Requires Login)
// =======================================================
// Assuming any registered user can create/register a hotel to become an owner
hotelRoute.post("/", JWT_middleware, createHotel);

// =======================================================
// 3. DYNAMIC PARAMETER ROUTES (MUST BE AT THE BOTTOM)
// =======================================================

// Public: View a single hotel's details
hotelRoute.get("/:id", getHotelDetailsById);

hotelRoute.patch("/:hotelId", 
    JWT_middleware, 
    isHotelOwner, 
    updateHotel
);

hotelRoute.delete("/:hotelId", 
    JWT_middleware, 
    isHotelOwner, 
    deleteHotel
);

// Protected: Image Upload Route
// Notice: isHotelOwner is placed BEFORE Multer. 
// This saves server RAM—if they aren't the owner, the file never even uploads!
hotelRoute.patch("/:hotelId/image",
    JWT_middleware,
    isHotelOwner, // You can swap this with isAdmin if only admins upload photos
    upload.single("hotelIMG"), 
    updateHotelImage
);

export default hotelRoute;