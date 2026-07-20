import express from "express";
import auth from "../../middleware/auth";
import { Role } from "@prisma/client";
import { adminController } from "./admin.controller";


const router = express.Router();

router.get("/users", auth(Role.ADMIN), adminController.getAllUsers);
router.get("/providers", auth(Role.ADMIN), adminController.getAllProviders);

router.patch(
  "/users/:id",
  auth(Role.ADMIN),
  adminController.updateRole
);

router.get("/orders", auth(Role.ADMIN), adminController.getOrders);

router.put(
  "/users/:id",
  auth(Role.ADMIN),
  adminController.updateUserStatus
);

export const adminRoutes = router;
