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
import { isAdmin } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const hotelRoute = express.Router()

hotelRoute.get("/search", searchHotel);

hotelRoute.post("/",
    JWT_middleware,
    isAdmin,
    createHotel
)

hotelRoute.patch("/:hotelId/image",
    JWT_middleware,
    upload.single("hotelIMG"),
    isAdmin,
    updateHotelImage
)

hotelRoute.get("/:hotelId/",
    getHotelDetailsById
)

hotelRoute.put("/:hotelId/",
    JWT_middleware,
    isAdmin,
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
    deleteHotel
)

export default hotelRoute