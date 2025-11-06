import { Router } from "express";
import {
  createProductSchema,
  deleteProductSchema,
  updateProductSchema,
} from "../schemas/productSchemas";
import { validateRequest } from "../middlewares/validateRequest";
import { getProducts, postProduct, putProduct, removeProduct } from "../controllers/productController";
import { authenticate } from "../middlewares/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/", authenticate, asyncHandler(getProducts));
router.post(
  "/",
  authenticate,
  validateRequest(createProductSchema),
  asyncHandler(postProduct),
);
router.put(
  "/:id",
  authenticate,
  validateRequest(updateProductSchema),
  asyncHandler(putProduct),
);
router.delete(
  "/:id",
  authenticate,
  validateRequest(deleteProductSchema),
  asyncHandler(removeProduct),
);

export default router;
