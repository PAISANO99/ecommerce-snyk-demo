import { Router } from "express";
import {
  getFeaturedProducts,
  getProductById,
  getProducts,
  postProduct,
  putProduct,
  removeProduct,
} from "../controllers/productController";
import { authenticateToken, authorizeRole, validateRequest, validationSchemas } from "../middlewares";

const router = Router();

router.get("/featured", getFeaturedProducts);
router.get("/", validateRequest(validationSchemas.products.list), getProducts);
router.get("/:id", validateRequest(validationSchemas.products.byId), getProductById);

router.post(
  "/",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  validateRequest(validationSchemas.products.create),
  postProduct
);
router.put(
  "/:id",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  validateRequest(validationSchemas.products.update),
  putProduct
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  validateRequest(validationSchemas.products.remove),
  removeProduct
);

export default router;
