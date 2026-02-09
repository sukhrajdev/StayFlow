import express from "express";
import {
    createHotel,
    updateHotelImage
} from "../controllers/hotel.controller.js";
import { JWT_middleware } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const hotelRoute = express.Router()

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


export default hotelRoute