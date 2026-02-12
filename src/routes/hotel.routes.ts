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
import { isAdmin,isHotelOwner } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const hotelRoute = express.Router()

hotelRoute.get("/search", searchHotel);

hotelRoute.post("/",
    JWT_middleware,
    isHotelOwner,
    createHotel
)

hotelRoute.patch("/:hotelId/image",
    JWT_middleware,
    upload.single("hotelIMG"),
    isHotelOwner,
    updateHotelImage
)

hotelRoute.get("/:hotelId/",
    getHotelDetailsById
)

hotelRoute.put("/:hotelId/",
    JWT_middleware,
    isHotelOwner,
    updateHotel
)

hotelRoute.get("/",
    getAllHotel
)


hotelRoute.get("/trends",
    mostRateHotel
)

hotelRoute.delete("/:hotelId/",
    JWT_middleware,
    isHotelOwner,
    deleteHotel
)

export default hotelRoute