import { Router } from "express";
import { createOrder, getOrders } from "../controllers/orderController";
import { authenticateToken, validateRequest, validationSchemas } from "../middlewares";

const router = Router();

router.post("/", validateRequest(validationSchemas.orders.create), createOrder);
router.get("/", authenticateToken, getOrders);

export default router;
