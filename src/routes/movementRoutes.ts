import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware";
import { validateRequest } from "../middlewares/validateRequest";
import { createMovementSchema } from "../schemas/movementSchemas";
import { getMovements, postMovement } from "../controllers/movementController";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/", authenticate, asyncHandler(getMovements));
router.post(
  "/",
  authenticate,
  validateRequest(createMovementSchema),
  asyncHandler(postMovement),
);

export default router;
