import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware";
import { validateRequest } from "../middlewares/validateRequest";
import {
  binExistsSchema,
  createWarehouseLocationSchema,
  getWarehouseLocationSchema,
  updateWarehouseLocationSchema,
} from "../schemas/locationSchemas";
import { asyncHandler } from "../utils/asyncHandler";
import { LocationController } from "../controllers/locationController";
import { LocationService } from "../services/locationService";

export const warehouseLocationRouter = Router({ mergeParams: true });
const locationController = new LocationController(new LocationService());

warehouseLocationRouter.use(authenticate);

warehouseLocationRouter.get(
  "/",
  validateRequest(getWarehouseLocationSchema),
  asyncHandler(locationController.getWarehouseLocations),
);
warehouseLocationRouter.post(
  "/",
  validateRequest(createWarehouseLocationSchema),
  asyncHandler(locationController.createWarehouseLocations),
);
warehouseLocationRouter.put(
  "/",
  validateRequest(updateWarehouseLocationSchema),
  asyncHandler(locationController.updateWarehouseLocations),
);

export const locationLookupRouter = Router();

locationLookupRouter.get(
  "/:binCode/exists",
  authenticate,
  validateRequest(binExistsSchema),
  asyncHandler(locationController.getBinExists),
);
