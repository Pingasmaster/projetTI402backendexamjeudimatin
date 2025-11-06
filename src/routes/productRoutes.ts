// gère les routes REST pour les produits
import { Router } from "express";
import {
  createProductSchema,
  deleteProductSchema,
  updateProductSchema,
} from "../schemas/productSchemas";
import { validateRequest } from "../middlewares/validateRequest";
import { authenticate } from "../middlewares/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";
import { ProductController } from "../controllers/productController";
import { ProductService } from "../services/productService";
import { isAdmin } from "../middlewares/isAdmin";

const router = Router();
const productController = new ProductController(new ProductService());

// liste paginée des produits disponibles
router.get("/", asyncHandler(productController.getProducts));
// crée un produit
router.post(
  "/",
  authenticate,
  validateRequest(createProductSchema),
  asyncHandler(productController.postProduct),
);
// mets à jour un produit ciblé via son identifiant
router.put(
  "/:id",
  authenticate,
  validateRequest(updateProductSchema),
  asyncHandler(productController.putProduct),
);
// supprime un produit et vérifie que l'utilisateur est administrateur
router.delete(
  "/:id",
  authenticate,
  isAdmin,
  validateRequest(deleteProductSchema),
  asyncHandler(productController.removeProduct),
);

export default router;
