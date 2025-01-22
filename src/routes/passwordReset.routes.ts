import express from "express";
import { PasswordResetController } from "../controllers/password.reset.controller";


let controller = new PasswordResetController();

const router = express.Router();

router.post("/request-password-reset",controller.requestPasswordReset);
router.post("/reset-password", controller.resetPassword);

export default router;
