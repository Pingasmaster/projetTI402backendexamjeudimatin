import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware";
import { validateRequest } from "../middlewares/validateRequest";
import {
  createWarehouseSchema,
  deleteWarehouseSchema,
  getWarehouseSchema,
  updateWarehouseSchema,
} from "../schemas/warehouseSchemas";
import { asyncHandler } from "../utils/asyncHandler";
import { WarehouseController } from "../controllers/warehouseController";
import { WarehouseService } from "../services/warehouseService";
import { isAdmin } from "../middlewares/isAdmin";

const router = Router();
const warehouseController = new WarehouseController(new WarehouseService());

router.get("/", asyncHandler(warehouseController.getWarehouses));
router.get(
  "/:id",
  validateRequest(getWarehouseSchema),
  asyncHandler(warehouseController.getWarehouseById),
);
router.post(
  "/",
  authenticate,
  validateRequest(createWarehouseSchema),
  asyncHandler(warehouseController.postWarehouse),
);
router.put(
  "/:id",
  authenticate,
  validateRequest(updateWarehouseSchema),
  asyncHandler(warehouseController.putWarehouse),
);
router.delete(
  "/:id",
  authenticate,
  isAdmin,
  validateRequest(deleteWarehouseSchema),
  asyncHandler(warehouseController.removeWarehouse),
);

export default router;
