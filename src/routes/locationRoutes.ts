// gestion des routes internes
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

// retourne la liste des emplacements d'un entrepôt donné
warehouseLocationRouter.get(
  "/",
  validateRequest(getWarehouseLocationSchema),
  asyncHandler(locationController.getWarehouseLocations),
);
// crée de nouveaux emplacements après authentification et validation
warehouseLocationRouter.post(
  "/",
  authenticate,
  validateRequest(createWarehouseLocationSchema),
  asyncHandler(locationController.createWarehouseLocations),
);
// met à jour des emplacements existants de l'entrepôt courant
warehouseLocationRouter.put(
  "/",
  authenticate,
  validateRequest(updateWarehouseLocationSchema),
  asyncHandler(locationController.updateWarehouseLocations),
);

export const locationLookupRouter = Router();

// vérifie si un emplacement correspondant au code de bac existe
locationLookupRouter.get(
  "/:binCode/exists",
  validateRequest(binExistsSchema),
  asyncHandler(locationController.getBinExists),
);
