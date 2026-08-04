import { Router } from "express";
import {
  getCategories,
  getCategoryBySlug,
  postCategory,
  putCategory,
  removeCategory,
} from "../controllers/categoryController";
import { authenticateToken, authorizeRole, validateRequest, validationSchemas } from "../middlewares";

const router = Router();

router.get("/", getCategories);
router.get("/:slug", validateRequest(validationSchemas.categories.bySlug), getCategoryBySlug);

router.post(
  "/",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  validateRequest(validationSchemas.categories.create),
  postCategory
);
router.put(
  "/:id",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  validateRequest(validationSchemas.categories.update),
  putCategory
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  validateRequest(validationSchemas.categories.remove),
  removeCategory
);

export default router;
