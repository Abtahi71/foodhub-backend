
import express from "express";
import auth from "../../middleware/auth";
import { Role } from "@prisma/client";
import { reviewController } from "./reviews.controller";


const router = express.Router();

router.post(
  "/provider/:providerId",
  auth(Role.CUSTOMER, Role.PROVIDER, Role.ADMIN),
  reviewController.reviewProvider
);

router.get(
  "/my_reviews/:providerId",
  auth(Role.CUSTOMER,Role.PROVIDER,Role.ADMIN),
  reviewController.getMyReviews
);

router.get("/all_reviews/:providerId", reviewController.getAllReviews);

export const reviewRoutes = router;
