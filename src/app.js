//import { mealsRoutes } from "./modules/meals/meals.routes";
import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { providerRoutes } from "./modules/provider/provider.routes";
import { orderRoutes } from "./modules/orders/order.routes";
import { adminRoutes } from "./modules/admin/admin.routes";
import { reviewRoutes } from "./modules/reviews/reviews.routes";
import { categoryRoutes } from "./modules/category/category.routes";
import cors from "cors";
import { mealsRoutes } from "./modules/meals/meals.routes";
import { authRoutes } from "./modules/auth/auth.route.js";
const app = express();
const port = process.env.BACKEND_PORT;
console.log("Better Auth URL:", process.env.BETTER_AUTH_URL);
console.log("App URL:", process.env.APP_URL);
console.log("Database URL:", process.env.DATABASE_URL);
const allowedOrigins = [
  process.env.BETTER_AUTH_URL || "http://localhost:3000",
  process.env.APP_URL, // Production frontend URL
].filter(Boolean); // Remove undefined values

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      // Check if origin is in allowedOrigins or matches Vercel preview pattern
      const isAllowed =
        allowedOrigins.includes(origin) ||
        /^https:\/\/next-blog-client.*\.vercel\.app$/.test(origin) ||
        /^https:\/\/.*\.vercel\.app$/.test(origin); // Any Vercel deployment

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  })
);
app.all("/api/auth/*splat", toNodeHandler(auth));
// Mount express json middleware after Better Auth handler
// or only apply it to routes that don't interact with Better Auth
app.use(express.json());
app.use("/provider", providerRoutes);
app.use("/meal", mealsRoutes);
app.use("/order", orderRoutes);
app.use("/admin", adminRoutes);
app.use("/review", reviewRoutes);
app.use("/categories", categoryRoutes);
app.use("/auth",authRoutes)

