import express from "express";
import { mealsController } from "./meals.controller";


const router = express.Router();

router.get("/", mealsController.getAllMeals);

router.get(
  "/providers",
  //auth(UserRole.CUSTOMER,UserRole.PROVIDER,UserRole.ADMIN),
  mealsController.getProviders
);

router.get("/:id", mealsController.getMealById);

router.get("/providers/:id", mealsController.getProviderById);

export const mealsRoutes = router;
