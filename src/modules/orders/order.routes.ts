import express from "express";

import { Role } from "@prisma/client";
import auth from "../../middleware/auth";
import { orderController } from "./order.controller";


const router = express.Router();

router.post(
  "/add_to_cart/:providerMealId",
  auth(Role.CUSTOMER, Role.PROVIDER),
  orderController.addToCart
);

router.get("/cart", auth(Role.CUSTOMER, Role.PROVIDER), orderController.getCart);
router.delete(
  "/clear_cart",
  auth(Role.CUSTOMER, Role.PROVIDER),
  orderController.clearCart
);
router.post(
  "/checkout",
  auth(Role.CUSTOMER, Role.PROVIDER),
  orderController.checkOutOrder
);
router.get("/getOrders", auth(Role.CUSTOMER, Role.PROVIDER), orderController.getOrders);
router.get(
  "/orders/:orderId",
  auth(Role.CUSTOMER, Role.PROVIDER),
  orderController.getOrderDetails
);

router.get('/getMyOrder', auth(Role.CUSTOMER, Role.PROVIDER), orderController.getMyOrder);



export const orderRoutes = router;
