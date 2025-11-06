import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { validateRequest } from "../middlewares/validateRequest";
import { asyncHandler } from "../utils/asyncHandler";
import { loginSchema, registerSchema } from "../schemas/authSchemas";

const router = Router();
const authController = new AuthController();

router.post(
  "/register",
  validateRequest(registerSchema),
  asyncHandler(authController.register),
);
router.post(
  "/login",
  validateRequest(loginSchema),
  asyncHandler(authController.login),
);

export default router;
