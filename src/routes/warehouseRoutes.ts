import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware";
import { validateRequest } from "../middlewares/validateRequest";
import {
  createWarehouseSchema,
  deleteWarehouseSchema,
  getWarehouseSchema,
  updateWarehouseSchema,
} from "../schemas/warehouseSchemas";
import {
  getWarehouses,
  getWarehouseById,
  postWarehouse,
  putWarehouse,
  removeWarehouse,
} from "../controllers/warehouseController";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(getWarehouses));
router.get(
  "/:id",
  validateRequest(getWarehouseSchema),
  asyncHandler(getWarehouseById),
);
router.post(
  "/",
  validateRequest(createWarehouseSchema),
  asyncHandler(postWarehouse),
);
router.put(
  "/:id",
  validateRequest(updateWarehouseSchema),
  asyncHandler(putWarehouse),
);
router.delete(
  "/:id",
  validateRequest(deleteWarehouseSchema),
  asyncHandler(removeWarehouse),
);

export default router;
