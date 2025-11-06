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

const router = Router();
const productController = new ProductController(new ProductService());

router.get("/", authenticate, asyncHandler(productController.getProducts));
router.post(
  "/",
  authenticate,
  validateRequest(createProductSchema),
  asyncHandler(productController.postProduct),
);
router.put(
  "/:id",
  authenticate,
  validateRequest(updateProductSchema),
  asyncHandler(productController.putProduct),
);
router.delete(
  "/:id",
  authenticate,
  validateRequest(deleteProductSchema),
  asyncHandler(productController.removeProduct),
);

export default router;
