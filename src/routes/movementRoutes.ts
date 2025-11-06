// expose les routes liées aux mouvements
import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware";
import { validateRequest } from "../middlewares/validateRequest";
import { createMovementSchema } from "../schemas/movementSchemas";
import { asyncHandler } from "../utils/asyncHandler";
import { MovementController } from "../controllers/movementController";
import { MovementService } from "../services/movementService";

const router = Router();
const movementController = new MovementController(new MovementService());

// expose l'historique des mouvements sans restriction
router.get("/", asyncHandler(movementController.getMovements));
// enregistre un nouveau mouvement après authentification et validation
router.post(
  "/",
  authenticate,
  validateRequest(createMovementSchema),
  asyncHandler(movementController.postMovement),
);

export default router;
