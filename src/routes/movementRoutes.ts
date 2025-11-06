import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware";
import { validateRequest } from "../middlewares/validateRequest";
import { createMovementSchema } from "../schemas/movementSchemas";
import { asyncHandler } from "../utils/asyncHandler";
import { MovementController } from "../controllers/movementController";
import { MovementService } from "../services/movementService";

const router = Router();
const movementController = new MovementController(new MovementService());

router.get("/", authenticate, asyncHandler(movementController.getMovements));
router.post(
  "/",
  authenticate,
  validateRequest(createMovementSchema),
  asyncHandler(movementController.postMovement),
);

export default router;
