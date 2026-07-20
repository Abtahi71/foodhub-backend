
import { Role } from "@prisma/client";
import express, { Router } from "express";
import auth from "../../middleware/auth";
import upload from "../../middleware/upload";
import { providerController } from "./provider.controller";




const router = express.Router();

router.post(
  "/register",
  auth(Role.CUSTOMER,Role.PROVIDER),
  upload.single("image"),
  providerController.register
);

router.put(
  "/update_provider/:id",
  auth(Role.PROVIDER),
  upload.single("image"),
  providerController.updateProvider
);

router.get(
  "/my_providers",
  auth(Role.PROVIDER),
  providerController.getMyProviders
);

router.get("/AllProviders", providerController.getAllProviders);

router.get(
  "/providerMeals/:id",
  auth(Role.PROVIDER),
  providerController.getProviderMeals
);

router.post(
  "/meals/:id",
  auth(Role.PROVIDER),
  upload.single("image"),
  providerController.createMeal
);

router.patch(
  "/meals/:id",
  auth(Role.PROVIDER),
  upload.single("image"),
  providerController.updateMeal
);
router.delete(
  "/meals/:id",
  auth(Role.PROVIDER),
  providerController.deleteMeal
);

router.patch(
  "/updateOrderStatus/:id",
  auth(Role.PROVIDER),
  providerController.updateOrderStatus
);

router.get(
  "/provider_orders/:providerId",
  auth(Role.PROVIDER),
  providerController.getProviderOrders
);

export const providerRoutes: Router = router;
