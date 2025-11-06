import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware";
import { validateRequest } from "../middlewares/validateRequest";
import {
  binExistsSchema,
  createWarehouseLocationSchema,
  getWarehouseLocationSchema,
  updateWarehouseLocationSchema,
} from "../schemas/locationSchemas";
import {
  createWarehouseLocations,
  getBinExists,
  getWarehouseLocations,
  updateWarehouseLocations,
} from "../controllers/locationController";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get(
  "/warehouses/:id/locations",
  authenticate,
  validateRequest(getWarehouseLocationSchema),
  asyncHandler(getWarehouseLocations),
);
router.post(
  "/warehouses/:id/locations",
  authenticate,
  validateRequest(createWarehouseLocationSchema),
  asyncHandler(createWarehouseLocations),
);
router.put(
  "/warehouses/:id/locations",
  authenticate,
  validateRequest(updateWarehouseLocationSchema),
  asyncHandler(updateWarehouseLocations),
);
router.get(
  "/locations/:binCode/exists",
  authenticate,
  validateRequest(binExistsSchema),
  asyncHandler(getBinExists),
);

export default router;
