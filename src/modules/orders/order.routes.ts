import express from "express";
import { orderController } from "./order.controller.js";
import auth, { UserRole } from "../../middleware/auth.js";

const router = express.Router();

router.post(
  "/add_to_cart/:providerMealId",
  auth(UserRole.CUSTOMER, UserRole.PROVIDER),
  orderController.addToCart
);

router.get("/cart", auth(UserRole.CUSTOMER, UserRole.PROVIDER), orderController.getCart);
router.delete(
  "/clear_cart",
  auth(UserRole.CUSTOMER, UserRole.PROVIDER),
  orderController.clearCart
);
router.post(
  "/checkout",
  auth(UserRole.CUSTOMER, UserRole.PROVIDER),
  orderController.checkOutOrder
);
router.get("/getOrders", auth(UserRole.CUSTOMER, UserRole.PROVIDER), orderController.getOrders);
router.get(
  "/orders/:orderId",
  auth(UserRole.CUSTOMER, UserRole.PROVIDER),
  orderController.getOrderDetails
);

router.get('/getMyOrder', auth(UserRole.CUSTOMER, UserRole.PROVIDER), orderController.getMyOrder);



export const orderRoutes = router;
