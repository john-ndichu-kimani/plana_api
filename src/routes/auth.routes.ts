import { Router } from "express";
import { verifyToken } from "../middlewares/auth";
import { authController } from "../controllers/auth.controller";


let controller = new authController();
let auth_router = Router()

auth_router.post('/login', controller.loginUser)
auth_router.get('/check-details',verifyToken,controller.checkDetails)

export default auth_router