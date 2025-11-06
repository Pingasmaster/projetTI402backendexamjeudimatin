// publie les routes HTTP pour les entrepôts
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

// liste l'ensemble des entrepôts
router.get("/", asyncHandler(warehouseController.getWarehouses));
// récupère les détails d'un entrepôt via son identifiant
router.get(
  "/:id",
  validateRequest(getWarehouseSchema),
  asyncHandler(warehouseController.getWarehouseById),
);
// crée un nouvel entrepôt après authentification
router.post(
  "/",
  authenticate,
  validateRequest(createWarehouseSchema),
  asyncHandler(warehouseController.postWarehouse),
);
// mets à jour les informations d'un entrepôt existant
router.put(
  "/:id",
  authenticate,
  validateRequest(updateWarehouseSchema),
  asyncHandler(warehouseController.putWarehouse),
);
// supprime un entrepôt et vérifie que l'utilisateur est administrateur
router.delete(
  "/:id",
  authenticate,
  isAdmin,
  validateRequest(deleteWarehouseSchema),
  asyncHandler(warehouseController.removeWarehouse),
);

export default router;
