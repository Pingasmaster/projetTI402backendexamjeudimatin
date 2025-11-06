// annonce les routes d'inscription et de connexion
import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { validateRequest } from "../middlewares/validateRequest";
import { asyncHandler } from "../utils/asyncHandler";
import { loginSchema, registerSchema } from "../schemas/authSchemas";

const router = Router();
const authController = new AuthController();

// route d'inscription : valide les données envoyées par le client avant de déléguer au contrôleur
router.post(
  "/register",
  validateRequest(registerSchema),
  asyncHandler(authController.register),
);
// route de connexion : gestion des identifiants pour connexion puis puis appel du contrôleur
router.post(
  "/login",
  validateRequest(loginSchema),
  asyncHandler(authController.login),
);

export default router;
