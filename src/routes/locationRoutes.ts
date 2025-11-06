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

export const warehouseLocationRouter = Router({ mergeParams: true });

warehouseLocationRouter.use(authenticate);

warehouseLocationRouter.get(
  "/",
  validateRequest(getWarehouseLocationSchema),
  asyncHandler(getWarehouseLocations),
);
warehouseLocationRouter.post(
  "/",
  validateRequest(createWarehouseLocationSchema),
  asyncHandler(createWarehouseLocations),
);
warehouseLocationRouter.put(
  "/",
  validateRequest(updateWarehouseLocationSchema),
  asyncHandler(updateWarehouseLocations),
);

export const locationLookupRouter = Router();

locationLookupRouter.get(
  "/:binCode/exists",
  authenticate,
  validateRequest(binExistsSchema),
  asyncHandler(getBinExists),
);
