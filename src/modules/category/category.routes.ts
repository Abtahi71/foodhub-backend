import express from "express";
import { categoryController } from "./category.controller";



const router = express.Router();

router.get('/',
    categoryController.getCategories)

router.get('/providers/:name',
    categoryController.getCategoryProviders)

router.get('/providers/:name/:providerId/meals',
    categoryController.getCategoryMeals
)



export const categoryRoutes = router;
