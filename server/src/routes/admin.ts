import { Router } from "express";
import {
  getAdminOrders,
  getAdminUsers,
  getDashboardMetrics,
  updateAdminOrderStatus,
} from "../controllers/adminController";
import { authenticateToken, authorizeRole, validateRequest, validationSchemas } from "../middlewares";

const router = Router();

router.use(authenticateToken, authorizeRole(["ADMIN"]));

router.get("/dashboard/metrics", getDashboardMetrics);
router.get("/users", validateRequest(validationSchemas.admin.listUsers), getAdminUsers);
router.get("/orders", validateRequest(validationSchemas.admin.listOrders), getAdminOrders);
router.patch(
  "/orders/:id/status",
  validateRequest(validationSchemas.admin.updateOrderStatus),
  updateAdminOrderStatus
);

export default router;
