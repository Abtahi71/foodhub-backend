// src/app.ts
import express8 from "express";
import { toNodeHandler } from "better-auth/node";

// src/lib/auth.js
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// src/lib/prisma.js
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/lib/auth.js
import nodemailer from "nodemailer";
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.APP_EMAIL,
    pass: process.env.APP_PASS
  }
});
var auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
    // or "mysql", "postgresql", ...etc
  }),
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  redirectTo: process.env.APP_URL,
  trustedOrigins: [
    process.env.APP_URL,
    "https://foodhub-frontend-gray.vercel.app",
    "https://foodhub-frontend-gray*.vercel.app",
    "https://foodhub-frontend*.vercel.app",
    "https://foodhub-frontend-*.vercel.app",
    "https://foodhub-frontend-*.vercel.app/*",
    "https://foodhub-frontend-*.vercel.app/api/auth/*",
    "https://localhost:3000",
    "http://localhost:4000"
  ],
  advanced: {
    useSecureCookies: true,
    crossDomain: {
      enabled: true
    },
    // crossSubDomainCookies: {
    //   enabled: true,
    // },
    // cookieSettings: {
    //   sessionToken: {
    //     attributes: {
    //       sameSite: "none",
    //       secure: true,
    //      // domain:".vercel.app"
    //     },
    //   },
    // },
    cookies: {
      session_token: {
        attributes: {
          //sameSite:"none",
          secure: true,
          httpOnly: true
          //domain:".vercel.app"
        }
      }
    }
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "CUSTOMER",
        required: false
      },
      password: {
        type: "string",
        required: true
      }
    }
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    //callbackUrl: `${process.env.APP_URL}`,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      const modifiedUrl = new URL(url);
      modifiedUrl.searchParams.set("callbackURL", process.env.APP_URL);
      const info = await transporter.sendMail({
        from: `"FoodHub" <${process.env.APP_EMAIL}>`,
        to: `${user.email}`,
        subject: "Please verify your email",
        text: `Hello,

Welcome \u{1F44B}
Thank you for creating an account with us.

To complete your registration, please verify your email address by clicking the link below:

${url}

If you didn\u2019t create this account, you can safely ignore this email.

This verification link will expire for security reasons.

Best regards,
Mustakim Abtahi
Support Team`,
        html: `<DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Verify Your Email</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 0;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; box-shadow:0 4px 10px rgba(0,0,0,0.05);">
          
          <-- Header -->
          <tr>
            <td style="padding:24px; text-align:center; background:#2563eb; color:#ffffff; border-radius:8px 8px 0 0;">
              <h1 style="margin:0; font-size:22px;">Verify Your Email</h1>
            </td>
          </tr>

          <-- Body -->
          <tr>
            <td style="padding:32px; color:#333333;">
              <p style="font-size:16px; margin:0 0 16px;">Hello \u{1F44B}</p>

              <p style="font-size:15px; line-height:1.6; margin:0 0 20px;">
                Thank you for signing up Please confirm your email address by clicking the button below.
              </p>

              <div style="text-align:center; margin:30px 0;">
                <a href="${modifiedUrl.toString()}" 
                   style="background:#2563eb; color:#ffffff; text-decoration:none; padding:14px 28px; border-radius:6px; font-size:16px; display:inline-block;">
                  Verify Email Address
                </a>
              </div>

              <p style="font-size:14px; color:#555555; line-height:1.6;">
                If you did not create this account, you can safely ignore this email.
              </p>

              <p style="font-size:14px; color:#777777; margin-top:24px;">
                This link may expire for security reasons.
              </p>
            </td>
          </tr>

          <-- Footer -->
          <tr>
            <td style="padding:20px; text-align:center; font-size:13px; color:#999999; background:#f9fafb; border-radius:0 0 8px 8px;">
              \xA9 2026 Mustakim Abtahi \xB7 All rights reserved
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
        // HTML body
      });
      console.log("Message sent: %s", info.messageId);
    }
  }
  // plugins: [nextCookies()],
});

// src/middleware/auth.js

import jwt from "jsonwebtoken";

// src/lib/prisma.ts
import "dotenv/config";
import { PrismaPg as PrismaPg2 } from "@prisma/adapter-pg";
import { PrismaClient as PrismaClient2 } from "@prisma/client";
var connectionString2 = `${process.env.DATABASE_URL}`;
var adapter2 = new PrismaPg2({ connectionString: connectionString2 });
var prisma2 = new PrismaClient2({ adapter: adapter2 });

// src/middleware/auth.js
var secret = process.env.BETTER_AUTH_SECRET;
var UserRole = {
  ADMIN: "ADMIN",
  PROVIDER: "PROVIDER",
  CUSTOMER: "CUSTOMER"
};
var auth2 = (...roles) => {
  return async (req, res, next) => {
    try {
      let token = req.headers.authorization;
      if (!req.headers.authorization) {
        token = req.cookies.token;
      }
      if (!token) {
        throw new Error("Token not found!!");
      }
      const decoded = jwt.verify(token, secret);
      const userData = await prisma2.user.findUnique({
        where: {
          email: decoded.email
        }
      });
      if (!userData) {
        throw new Error("Unauthorized!");
      }
      if (roles.length && !roles.includes(decoded.role)) {
        throw new Error("Unauthorized!!!");
      }
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};
var auth_default = auth2;

// src/modules/provider/provider.routes.js
import express from "express";

// src/modules/provider/provider.services.js
import { OrderStatus } from "@prisma/client";
var register = async (userId, providerData) => {
  const existingProvider = await prisma.provider.findFirst({
    where: { userId }
  });
  if (!existingProvider) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        role: UserRole.PROVIDER
      }
    });
  }
  const provider = await prisma.provider.create({
    data: {
      restaurantName: providerData.restaurantName,
      description: providerData.description,
      isOpen: providerData.isOpen,
      address: providerData.address,
      phone: providerData.phone,
      website: providerData.website,
      cuisineType: providerData.cuisineType,
      image: providerData.image,
      user: {
        connect: {
          id: userId
        }
      }
    }
  });
  return provider;
};
var getMyProviders = async (userId, search) => {
  const totalRevenue = await prisma.order.aggregate({
    where: {
      provider: {
        userId,
        restaurantName: search ? {
          contains: search,
          mode: "insensitive"
        } : void 0
      },
      status: OrderStatus.DELIVERED
    },
    _sum: {
      totalAmount: true
    }
  });
  const providers = await prisma.provider.findMany({
    where: {
      userId,
      restaurantName: search ? {
        contains: search,
        mode: "insensitive"
      } : void 0
    },
    select: {
      id: true,
      restaurantName: true,
      address: true,
      isOpen: true,
      image: true,
      createdAt: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
  const result = {
    totalRevenue: totalRevenue._sum.totalAmount || 0,
    providers
  };
  return result;
};
var createMeal = async (mealData, imageUrl, providerId, isAvailable) => {
  const category = mealData.category.toLowerCase();
  return prisma.$transaction(async (tx) => {
    const meal = await tx.meal.create({
      data: {
        name: mealData.name,
        description: mealData.description,
        category: {
          connectOrCreate: {
            where: { name: category },
            create: { name: category }
          }
        }
      },
      include: {
        provider: true,
        category: true
      }
    });
    const providerMeal = await tx.providerMeal.create({
      data: {
        mealId: meal.id,
        providerId,
        isAvailable,
        price: Number(mealData.price),
        image: imageUrl
      }
    });
    return { meal, providerMeal };
  });
};
var updateMeal = async (mealData, mealId) => {
  const existingRecord = await prisma.providerMeal.findUnique({
    where: {
      id: mealId
    }
  });
  if (!existingRecord) {
    throw new Error(`This Meal is not found for this provider`);
  }
  const result = await prisma.providerMeal.update({
    where: { id: mealId },
    data: {
      ...mealData.isAvailable !== void 0 && {
        isAvailable: mealData.isAvailable
      },
      ...mealData.price !== void 0 && {
        price: mealData.price
      },
      ...mealData.image !== void 0 && {
        image: mealData.image
      },
      meal: {
        update: {
          ...mealData.name && { name: mealData.name },
          ...mealData.description && { description: mealData.description },
          ...mealData.category && {
            category: {
              connectOrCreate: {
                where: { name: mealData.category.toLowerCase() },
                create: { name: mealData.category.toLowerCase() }
              }
            }
          }
        }
      }
    }
  });
  return result;
};
var deleteMeal = async (mealId, providerId) => {
  const providerMeal = await prisma.providerMeal.findFirst({
    where: { id: mealId }
  });
  if (!providerMeal) {
    throw new Error("Meal not found");
  }
  const provider = await prisma.provider.findFirst({
    where: {
      id: providerMeal?.providerId,
      userId: providerId
    }
  });
  if (!provider) {
    throw new Error("You are not authorized to delete this meal");
  }
  console.log(provider?.id);
  console.log(mealId);
  return prisma.$transaction(async (tx) => {
    const meal = await tx.providerMeal.findUnique({
      where: {
        id: mealId
      }
    });
    if (!meal) {
      throw new Error("Meal not found or you are not the provider");
    }
    await tx.providerMeal.delete({
      where: {
        id: mealId
      }
    });
  });
};
var getAllProviders = async () => {
  return await prisma.provider.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      },
      meals: {
        where: {
          isAvailable: true
        },
        include: {
          meal: true
        }
      }
    }
  });
};
var getProviderMeals = async (providerId) => {
  return await prisma.provider.findUnique({
    where: {
      id: providerId
    },
    select: {
      meals: {
        select: {
          id: true,
          image: true,
          meal: {
            select: {
              name: true,
              description: true,
              category: {
                select: {
                  name: true
                }
              }
            }
          },
          price: true,
          isAvailable: true
        }
      }
    }
  });
};
var updateOrderStatus = async (orderId, status, userId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      provider: true
    }
  });
  if (!order) {
    throw new Error("Order not found");
  }
  if (order.provider.userId !== userId) {
    throw new Error("You are not the provider for this order");
  }
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      status
    }
  });
  return updatedOrder;
};
var getProviderOrders = async (providerId) => {
  const orders = await prisma.order.findMany({
    where: {
      providerId
    },
    select: {
      id: true,
      status: true,
      totalAmount: true,
      deliveryAddress: true,
      contact: true,
      items: {
        select: {
          Providermeal: {
            select: {
              meal: {
                select: {
                  name: true,
                  description: true
                }
              }
            }
          }
        }
      },
      customer: {
        select: {
          name: true,
          email: true
        }
      }
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }]
  });
  return orders;
};
var updateProvider = async (providerId, providerData) => {
  const updatedProvider = await prisma.provider.update({
    where: { id: providerId },
    data: providerData
  });
  return updatedProvider;
};
var providerServices = {
  updateProvider,
  getProviderOrders,
  getMyProviders,
  updateOrderStatus,
  getProviderMeals,
  createMeal,
  updateMeal,
  register,
  deleteMeal,
  getAllProviders
};

// src/config/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
var cloudinary_default = cloudinary;

// src/modules/provider/provider.controller.ts
var register2 = async (req, res) => {
  const userId = req.user?.id;
  console.log("USER ID:", userId);
  if (!userId) {
    return res.status(400).json({ message: "User id is required" });
  }
  try {
    let imageUrl;
    if (req.file) {
      const result2 = await cloudinary_default.uploader.upload(req.file.path, {
        folder: "providers"
      });
      imageUrl = result2.secure_url;
    }
    const isOpen = req.body.isOpen ? req.body.isOpen === "true" ? true : false : true;
    let cuisineTypeArray;
    if (typeof req.body.cuisineType === "string") {
      try {
        const cleanedString = req.body.cuisineType.trim();
        cuisineTypeArray = JSON.parse(cleanedString);
      } catch (error) {
        cuisineTypeArray = req.body.cuisineType.split(",").map((item) => item.trim());
      }
    } else if (Array.isArray(req.body.cuisineType)) {
      cuisineTypeArray = req.body.cuisineType;
    } else {
      cuisineTypeArray = [];
    }
    const providerData = {
      ...req.body,
      isOpen,
      cuisineType: cuisineTypeArray,
      image: imageUrl
    };
    const result = await providerServices.register(userId, providerData);
    return res.status(201).json({ data: result, message: "Provider registered successfully" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
var getMyProviders2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    const search = req.query.searchTerm;
    console.log("this is the search query:", search);
    const result = await providerServices.getMyProviders(
      userId,
      search
    );
    return res.status(200).json({ data: result, message: "Providers fetched successfully" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
var getProviderOrders2 = async (req, res) => {
  const providerId = req.params.providerId;
  try {
    const result = await providerServices.getProviderOrders(
      providerId
    );
    return res.status(200).json({ data: result, message: "Orders fetched successfully" });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ message: e.message });
  }
};
var createMeal2 = async (req, res) => {
  try {
    console.log("NAME FIELD:", req.body.name);
    let imageUrl;
    if (req.file) {
      const result2 = await cloudinary_default.uploader.upload(req.file.path, {
        folder: "providers"
      });
      imageUrl = result2.secure_url;
    }
    const providerId = req.params.id;
    console.log(providerId);
    const isAvailable = req.body.isAvailable ? req.body.isAvailable === "true" ? true : false : true;
    const result = await providerServices.createMeal(
      req.body,
      imageUrl,
      providerId,
      isAvailable
    );
    return res.status(201).json({ data: result, message: "Meal created successfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: e.message });
  }
};
var updateMeal2 = async (req, res) => {
  try {
    const mealId = req.params.id;
    let imageUrl;
    if (req.file) {
      const result2 = await cloudinary_default.uploader.upload(req.file.path, {
        folder: "providers"
      });
      imageUrl = result2.secure_url;
    }
    console.log(typeof req.body.isAvailable, req.body.isAvailable);
    const isAvailable = req.body.isAvailable ? req.body.isAvailable === "true" ? true : false : void 0;
    const updatedData = {
      ...req.body,
      isAvailable,
      image: imageUrl
    };
    const result = await providerServices.updateMeal(
      updatedData,
      mealId
    );
    return res.status(200).json({ data: result, message: "Meal updated successfully" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
var deleteMeal2 = async (req, res) => {
  const providerId = req.user?.id;
  const mealId = req.params.id;
  console.log(providerId, mealId);
  try {
    await providerServices.deleteMeal(mealId, providerId);
    return res.status(200).json({ message: "Meal deleted successfully" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
var getAllProviders2 = async (req, res) => {
  try {
    const result = await providerServices.getAllProviders();
    return res.status(200).json({ data: result, message: "Providers fetched successfully" });
  } catch (e) {
    res.status(500).json({ message: "Internal server error" });
  }
};
var getProviderMeals2 = async (req, res) => {
  const providerId = req.params.id;
  try {
    const result = await providerServices.getProviderMeals(
      providerId
    );
    return res.status(200).json({ data: result, message: "Meals fetched successfully" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
var updateOrderStatus2 = async (req, res) => {
  const userId = req.user?.id;
  const orderId = req.params.id;
  const { status } = req.body;
  const validStatuses = ["PENDING", "ON_THE_WAY", "PREPARING", "DELIVERED"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  try {
    const result = await providerServices.updateOrderStatus(
      orderId,
      status,
      userId
    );
    return res.status(200).json({ data: result, message: "Order status updated successfully" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
var updateProvider2 = async (req, res) => {
  const providerId = req.params.id;
  const userId = req.user?.id;
  console.log(providerId, userId);
  try {
    let imageUrl;
    if (req.file) {
      const result2 = await cloudinary_default.uploader.upload(req.file.path, {
        folder: "providers"
      });
      imageUrl = result2.secure_url;
    }
    const isOpen = req.body.isOpen ? req.body.isOpen === "true" ? true : false : true;
    let cuisineTypeArray;
    if (typeof req.body.cuisineType === "string") {
      try {
        const cleanedString = req.body.cuisineType.trim();
        cuisineTypeArray = JSON.parse(cleanedString);
      } catch (error) {
        cuisineTypeArray = req.body.cuisineType.split(",").map((item) => item.trim());
      }
    } else if (Array.isArray(req.body.cuisineType)) {
      cuisineTypeArray = req.body.cuisineType;
    } else {
      cuisineTypeArray = [];
    }
    const providerData = {
      ...req.body,
      isOpen,
      cuisineType: cuisineTypeArray,
      image: imageUrl
    };
    const result = await providerServices.updateProvider(
      providerId,
      providerData
    );
    return res.status(200).json({ data: result, message: "Provider updated successfully" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
var providerController = {
  updateProvider: updateProvider2,
  getProviderOrders: getProviderOrders2,
  getMyProviders: getMyProviders2,
  updateOrderStatus: updateOrderStatus2,
  getProviderMeals: getProviderMeals2,
  createMeal: createMeal2,
  updateMeal: updateMeal2,
  register: register2,
  deleteMeal: deleteMeal2,
  getAllProviders: getAllProviders2
};

// src/middleware/upload.ts
import multer from "multer";
var storage = multer.diskStorage({});
var upload = multer({ storage });
var upload_default = upload;

// src/modules/provider/provider.routes.js
var router = express.Router();
router.post("/register", auth_default(UserRole.CUSTOMER, UserRole.PROVIDER), upload_default.single("image"), providerController.register);
router.put("/update_provider/:id", auth_default(UserRole.PROVIDER), upload_default.single("image"), providerController.updateProvider);
router.get("/my_providers", auth_default(UserRole.PROVIDER), providerController.getMyProviders);
router.get("/AllProviders", providerController.getAllProviders);
router.get("/providerMeals/:id", auth_default(UserRole.PROVIDER), providerController.getProviderMeals);
router.post("/meals/:id", auth_default(UserRole.PROVIDER), upload_default.single("image"), providerController.createMeal);
router.put("/meals/:id", auth_default(UserRole.PROVIDER), upload_default.single("image"), providerController.updateMeal);
router.delete("/meals/:id", auth_default(UserRole.PROVIDER), providerController.deleteMeal);
router.put("/updateOrderStatus/:id", auth_default(UserRole.PROVIDER), providerController.updateOrderStatus);
router.get("/provider_orders/:providerId", auth_default(UserRole.PROVIDER), providerController.getProviderOrders);
var providerRoutes = router;

// src/modules/orders/order.routes.js
import express2 from "express";

// src/modules/orders/order.services.js
var addToCart = async (quantity, userId, providerMealId) => {
  let message = "";
  const providerMeal = await prisma.providerMeal.findUnique({
    where: {
      id: providerMealId
    }
  });
  if (!providerMeal || !providerMeal.isAvailable) {
    return message = "Meal not found";
  }
  const existingCart = await prisma.cart.findUnique({
    where: {
      userId
    },
    select: {
      providerId: true
    }
  });
  if (existingCart && existingCart.providerId !== providerMeal.providerId) {
    return message = "You can only add items from one restaurant at a time. Clear your cart first?";
  } else {
    message = "Items added to cart successfully";
  }
  const cart = await prisma.cart.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      providerId: providerMeal.providerId
    }
  });
  const cart2 = await prisma.cartItem.upsert({
    where: {
      cartId_providerMealId: {
        cartId: cart.id,
        providerMealId
      }
    },
    update: {
      quantity: { increment: quantity }
    },
    create: {
      cartId: cart.id,
      providerMealId,
      quantity
    }
  });
  return { message, cartItem: cart2 };
};
var clearCart = async (userId) => {
  const cart = await prisma.cart.findUnique({
    where: {
      userId
    }
  });
  if (cart) {
    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id
      }
    });
    await prisma.cart.delete({
      where: {
        id: cart.id
      }
    });
    return { message: "Cart cleared successfully" };
  } else {
    return { message: "Cart is already empty" };
  }
};
var getCart = async (userId) => {
  const cart = await prisma.cart.findUnique({
    where: {
      userId
    },
    select: {
      id: true,
      items: {
        select: {
          providerMeal: {
            select: {
              meal: {
                select: {
                  name: true,
                  description: true
                }
              },
              provider: {
                select: {
                  restaurantName: true
                }
              },
              price: true,
              image: true
            }
          },
          quantity: true
        }
      }
    }
  });
  let totalAmount = 0;
  if (!cart || cart.items.length === 0) {
    return { cart: null, totalAmount: 0 };
  }
  const orderItems = cart.items.map((item) => {
    totalAmount += item.quantity * item.providerMeal.price;
  });
  return { cart, totalAmount };
};
var checkOutOrder = async (orderData, userId) => {
  let message = "";
  const cart = await prisma.cart.findUnique({
    where: {
      userId
    },
    select: {
      id: true,
      providerId: true,
      items: {
        include: {
          providerMeal: true
        }
      }
    }
  });
  if (!cart || cart.items.length === 0) {
    return message = "Cart is empty";
  }
  let totalAmount = 0;
  const orderItems = cart.items.map((item) => {
    totalAmount += item.quantity * item.providerMeal.price;
    return {
      Providermeal: {
        connect: { id: item.providerMealId }
      },
      quantity: item.quantity,
      price: item.providerMeal.price
    };
  });
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        customerId: userId,
        providerId: cart.providerId,
        totalAmount,
        deliveryAddress: orderData.deliveryAddress,
        paymentMethod: orderData.paymentMethod,
        contact: orderData.contact,
        items: {
          create: orderItems
        }
      }
    });
    await tx.cartItem.deleteMany({
      where: {
        cartId: cart.id
      }
    });
    await tx.cart.delete({
      where: {
        id: cart.id
      }
    });
    return newOrder;
  });
  return order;
};
var getOrders = async (userId) => {
  const result = await prisma.order.findMany({
    where: {
      customerId: userId
    },
    include: {
      items: {
        include: {
          Providermeal: {
            select: {
              meal: {
                select: {
                  name: true,
                  description: true
                }
              }
            }
          }
        }
      },
      provider: {
        select: {
          restaurantName: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
  const aggregate = await prisma.order.aggregate({
    where: {
      customerId: userId
    },
    _sum: {
      totalAmount: true
    }
  });
  return {
    result,
    totalAmount: aggregate._sum.totalAmount
  };
};
var getOrderDetails = async (orderId, userId) => {
  const result = await prisma.order.findFirst({
    where: {
      id: orderId,
      customerId: userId
    },
    select: {
      status: true,
      totalAmount: true,
      deliveryAddress: true,
      createdAt: true,
      paymentMethod: true,
      items: {
        select: {
          Providermeal: {
            select: {
              meal: {
                select: {
                  name: true,
                  description: true
                }
              }
            }
          }
        }
      },
      provider: {
        select: {
          restaurantName: true
        }
      }
    }
  });
  return result;
};
var orderServices = {
  checkOutOrder,
  getOrders,
  getOrderDetails,
  addToCart,
  getCart,
  clearCart
};

// src/modules/orders/order.controller.ts
var addToCart2 = async (req, res) => {
  try {
    const providerMealId = req.params.providerMealId;
    const userId = req.user?.id;
    console.log("THIS IS THE PROVIDER MEAL ID", providerMealId);
    console.log("THIS IS THE USER ID", userId);
    const { quantity } = req.body;
    const result = await orderServices.addToCart(
      quantity,
      userId,
      providerMealId
    );
    if (typeof result === "string") {
      console.log("THIS IS THE RESULT", result);
      res.status(200).json({ message: result });
    } else {
      res.status(200).json({ message: result.message, data: result.cartItem });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message });
    return;
  }
};
var clearCart2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    console.log("THIS IS THE USER ID", userId);
    const response = await orderServices.clearCart(
      userId
    );
    console.log(response.message);
    res.status(200).json({ message: response.message });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};
var getCart2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    const result = await orderServices.getCart(
      userId
    );
    if (result.cart == null) {
      res.status(200).json({ message: "Cart is empty", data: null });
      return;
    }
    res.status(200).json({ message: "Cart fetched successfully", data: result });
  } catch (e) {
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};
var checkOutOrder2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    const result = await orderServices.checkOutOrder(
      req.body,
      userId
    );
    if (typeof result === "string") {
      res.status(200).json({ message: result });
      return;
    }
    res.status(201).json({ message: "Order created successfully", data: result });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
var getOrders2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    const result = await orderServices.getOrders(userId);
    res.status(200).json({ message: "Orders fetched successfully", data: result });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
var getOrderDetails2 = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user?.id;
    const result = await orderServices.getOrderDetails(
      orderId,
      userId
    );
    res.status(200).json({ message: "Order details fetched successfully", data: result });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
var orderController = { checkOutOrder: checkOutOrder2, getOrders: getOrders2, getOrderDetails: getOrderDetails2, addToCart: addToCart2, getCart: getCart2, clearCart: clearCart2 };

// src/modules/orders/order.routes.js
var router2 = express2.Router();
router2.post("/add_to_cart/:providerMealId", auth_default(UserRole.CUSTOMER), orderController.addToCart);
router2.get("/cart", auth_default(UserRole.CUSTOMER), orderController.getCart);
router2.delete("/clear_cart", auth_default(UserRole.CUSTOMER), orderController.clearCart);
router2.post("/checkout", auth_default(UserRole.CUSTOMER), orderController.checkOutOrder);
router2.get("/getOrders", auth_default(UserRole.CUSTOMER), orderController.getOrders);
router2.get("/orders/:orderId", auth_default(UserRole.CUSTOMER), orderController.getOrderDetails);
var orderRoutes = router2;

// src/modules/admin/admin.routes.js
import express3 from "express";

// src/modules/admin/admin.services.js
var getAllUsers = async ({ search, name, role, isActive, page, skip = 0, limit = 10, sortBy = "createdAt", sortOrder = "desc" }) => {
  const andConditions = [];
  if (search) {
    andConditions.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } }
      ]
    });
  }
  if (role) {
    andConditions.push({
      role
    });
  }
  if (isActive !== void 0) {
    andConditions.push({
      isActive
    });
  }
  const users = await prisma.user.findMany({
    take: limit,
    skip,
    where: {
      AND: andConditions
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      isActive: true
    },
    orderBy: {
      [sortBy]: sortOrder
    }
  });
  const total = await prisma.user.count({
    where: { AND: andConditions }
  });
  const userWithOrderCounts = await Promise.all(users.map(async (user) => {
    const orderCount = await prisma.order.count({
      where: {
        customerId: user.id
      }
    });
    return {
      ...user,
      orderCount
    };
  }));
  return {
    userWithOrderCounts,
    pagination: {
      total,
      page: page || 1,
      limit: limit || 10,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page ? page : 1 < Math.ceil(total / limit),
      hasPrevPage: page ? page : 1 > 1
    }
  };
};
var getOrders3 = async ({ page, skip = 0, limit = 10 }) => {
  const orders = await prisma.order.findMany({
    select: {
      id: true,
      totalAmount: true,
      createdAt: true,
      contact: true,
      status: true,
      provider: {
        select: {
          restaurantName: true
        }
      },
      customer: {
        select: {
          name: true,
          email: true
        }
      }
    }
  });
  const total = await prisma.order.count();
  return {
    orders,
    pagination: {
      total,
      page: page || 1,
      limit: limit || 10,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page ? page : 1 < Math.ceil(total / limit),
      hasPrevPage: page ? page : 1 > 1
    }
  };
};
var updateUserRole = async (userId, role) => {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      role
    }
  });
  return {
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role
  };
};
var updateUserStatus = async (userId, isActive) => {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      isActive
    }
  });
  return {
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    isActive: updatedUser.isActive
  };
};
var adminServices = {
  getAllUsers,
  updateUserRole,
  getOrders: getOrders3,
  updateUserStatus
};

// src/helpers/pagination.js
var pagination = (options) => {
  const page = options.page ? Number(options.page) : 1;
  const limit = options.limit ? Number(options.limit) : 10;
  const skip = (page - 1) * limit;
  const sortBy = options.sortBy ? options.sortBy : "createdAt";
  const sortOrder = options.sortOrder === "desc" ? "desc" : "asc";
  return { page, skip, limit, sortBy, sortOrder };
};

// src/modules/admin/admin.controller.ts
var getAllUsers2 = async (req, res) => {
  try {
    const search = req.query.search;
    const searchString = typeof search === "string" ? search : void 0;
    const name = req.query.name;
    let role = req.query.role;
    role = role?.toUpperCase() || void 0;
    const isActive = req.query.isActive ? req.query.isActive === "true" ? true : false : void 0;
    const { page, skip, limit } = pagination(req.query);
    const result = await adminServices.getAllUsers({
      search: searchString,
      name,
      role,
      isActive,
      page,
      skip,
      limit
    });
    res.status(200).json({ message: "Users fetched successfully", data: result });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
var updateUserRole2 = async (req, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;
    const validRoles = Object.values(UserRole);
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: `Invalid role. Valid roles are: ${validRoles.join(", ")}`
      });
    }
    const Role = role;
    const result = await adminServices.updateUserRole(userId, role);
    res.status(200).json({ message: "User role updated successfully", data: result });
  } catch (e) {
    res.status(500).json({ message: "Internal server error" });
  }
};
var getOrders4 = async (req, res) => {
  try {
    console.log("auiufdbfiuabsfiafnoafbaojfoafaofnoa");
    console.log("Received query parameters for orders:", req.query);
    const { page, skip, limit } = pagination(req.query);
    const result = await adminServices.getOrders({ page, skip, limit });
    console.log(result);
    res.status(200).json({ message: "Orders fetched successfully", data: result });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
var updateUserStatus2 = async (req, res) => {
  try {
    const userId = req.params.id;
    const { status } = req.body;
    const isActive = status === "true" ? true : false;
    const result = await adminServices.updateUserStatus(
      userId,
      isActive
    );
    res.status(200).json({ message: "User status updated successfully", data: result });
  } catch (e) {
    res.status(500).json({ message: "Internal server error", error: e.message });
  }
};
var adminController = {
  getAllUsers: getAllUsers2,
  updateUserRole: updateUserRole2,
  getOrders: getOrders4,
  updateUserStatus: updateUserStatus2
};

// src/modules/admin/admin.routes.js
var router3 = express3.Router();
router3.get("/users", auth_default(UserRole.ADMIN), adminController.getAllUsers);
router3.patch("/users/:id", auth_default(UserRole.ADMIN), adminController.updateUserRole);
router3.get("/orders", auth_default(UserRole.ADMIN), adminController.getOrders);
router3.put("/users/:id", auth_default(UserRole.ADMIN), adminController.updateUserStatus);
var adminRoutes = router3;

// src/modules/reviews/reviews.routes.js
import express4 from "express";

// src/modules/reviews/reviews.services.js
var reviewProvider = async (userId, providerId, rating, comment) => {
  const isOrdered = await prisma.order.findFirst({
    where: {
      customerId: userId,
      providerId
    }
  });
  if (!isOrdered)
    throw new Error("You can only review providers you have ordered from.");
  const existingReview = await prisma.review.findFirst({
    where: {
      userId,
      providerId
    },
    select: {
      id: true
    }
  });
  const result = await prisma.review.upsert({
    where: {
      userId_providerId: {
        userId,
        providerId
      }
    },
    update: {
      rating,
      comment
    },
    create: {
      userId,
      providerId,
      rating,
      comment
    }
  });
  if (existingReview)
    return { message: "Review updated successfully", review: result };
  return { message: "Review submitted successfully", review: result };
};
var getMyReviews = async (userId, providerId) => {
  const reviews = await prisma.review.findFirst({
    where: {
      userId,
      providerId
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      provider: {
        select: {
          restaurantName: true
        }
      }
    }
  });
  return reviews;
};
var getAllReviews = async (providerId) => {
  const reviews = await prisma.review.findMany({
    where: {
      providerId
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      user: {
        select: {
          name: true
        }
      }
    }
  });
  return reviews;
};
var reviewServices = { reviewProvider, getMyReviews, getAllReviews };

// src/modules/reviews/reviews.controller.ts
var reviewProvider2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    const providerId = req.params.providerId;
    const { rating, comment } = req.body;
    const result = await reviewServices.reviewProvider(
      userId,
      providerId,
      rating,
      comment
    );
    return res.status(201).json({ data: result, message: result.message });
  } catch (e) {
    console.log(e.message);
    return res.status(500).json({ message: e.message });
  }
};
var getMyReviews2 = async (req, res) => {
  const userId = req.user?.id;
  const providerId = req.params.providerId;
  try {
    const result = await reviewServices.getMyReviews(
      userId,
      providerId
    );
    return res.status(200).json({ data: result });
  } catch (e) {
    console.log(e.message);
    return res.status(500).json({ message: e.message });
  }
};
var getAllReviews2 = async (req, res) => {
  const providerId = req.params.providerId;
  try {
    const result = await reviewServices.getAllReviews(providerId);
    return res.status(200).json({ data: result });
  } catch (e) {
    console.log(e.message);
    return res.status(500).json({ message: e.message });
  }
};
var reviewController = { reviewProvider: reviewProvider2, getMyReviews: getMyReviews2, getAllReviews: getAllReviews2 };

// src/modules/reviews/reviews.routes.js
var router4 = express4.Router();
router4.post("/provider/:providerId", auth_default(UserRole.CUSTOMER), reviewController.reviewProvider);
router4.get("/my_reviews/:providerId", auth_default(UserRole.CUSTOMER), reviewController.getMyReviews);
router4.get("/all_reviews/:providerId", reviewController.getAllReviews);
var reviewRoutes = router4;

// src/modules/category/category.routes.js
import express5 from "express";

// src/modules/category/category.services.js
var getCategories = async () => {
  const categories = await prisma.category.findMany({
    select: {
      name: true,
      id: true
    }
  });
  return categories;
};
var getCategoryProviders = async (name) => {
  const providers = await prisma.provider.findMany({
    where: {
      cuisineType: {
        has: name
      }
    },
    select: {
      id: true,
      restaurantName: true,
      address: true,
      isOpen: true,
      image: true,
      createdAt: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
  return providers;
};
var getCategoryMeals = async (providerId, category) => {
  const meals = await prisma.providerMeal.findMany({
    where: {
      providerId,
      isAvailable: true,
      meal: {
        category: {
          name: category
        }
      }
    },
    select: {
      price: true,
      image: true,
      id: true,
      meal: {
        select: {
          name: true,
          description: true,
          category: {
            select: {
              name: true
            }
          }
        }
      }
    }
  });
  return meals;
};
var categoryService = {
  getCategories,
  getCategoryProviders,
  getCategoryMeals
};

// src/modules/category/category.controller.ts
var getCategories2 = async (req, res) => {
  try {
    const result = await categoryService.getCategories();
    return res.json({ categories: result });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
};
var getCategoryProviders2 = async (req, res) => {
  try {
    const { name } = req.params;
    const result = await categoryService.getCategoryProviders(name);
    return res.json({ result });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
};
var getCategoryMeals2 = async (req, res) => {
  try {
    const { name, providerId } = req.params;
    if (!providerId) {
      return res.status(400).json({ error: "providerId query parameter is required" });
    }
    const result = await categoryService.getCategoryMeals(providerId, name);
    return res.json({ result });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
};
var categoryController = { getCategories: getCategories2, getCategoryProviders: getCategoryProviders2, getCategoryMeals: getCategoryMeals2 };

// src/modules/category/category.routes.js
var router5 = express5.Router();
router5.get("/", categoryController.getCategories);
router5.get("/providers/:name", categoryController.getCategoryProviders);
router5.get("/providers/:name/:providerId/meals", categoryController.getCategoryMeals);
var categoryRoutes = router5;

// src/app.ts
import cors from "cors";

// src/modules/meals/meals.routes.js
import express6 from "express";

// src/modules/meals/meals.service.js
var getAllMeals = async ({ search, name, description, isAvailable, category, reviews, ratings, page, limit, skip, sortBy, sortOrder }) => {
  const andConditions = [];
  if (search) {
    andConditions.push({
      OR: [
        { meal: { name: { contains: search, mode: "insensitive" } } },
        { meal: { description: { contains: search, mode: "insensitive" } } },
        { provider: { restaurantName: { contains: search, mode: "insensitive" } } }
      ]
    });
  }
  console.log("Search condition:", search);
  if (typeof ratings === "number" && !isNaN(ratings)) {
    andConditions.push({
      provider: {
        reviews: {
          some: {
            rating: {
              gte: ratings
            }
          }
        }
      }
    });
  }
  if (category) {
    andConditions.push({ meal: { category: { name: { equals: category, mode: "insensitive" } } } });
  }
  if (typeof isAvailable === "boolean") {
    andConditions.push({ isAvailable });
  }
  console.log("Final WHERE conditions:", JSON.stringify(andConditions, null, 2));
  const result = await prisma.providerMeal.findMany({
    take: limit,
    skip,
    where: {
      AND: andConditions
    },
    orderBy: sortBy === "createdAt" ? { meal: { createdAt: sortOrder } } : sortBy === "price" ? { price: sortOrder } : { [sortBy]: sortOrder },
    // For other fields like 'name' which are in Meal model
    select: {
      id: true,
      price: true,
      isAvailable: true,
      meal: {
        select: {
          name: true,
          description: true,
          category: {
            select: {
              name: true
            }
          }
        }
      },
      provider: {
        select: {
          id: true,
          restaurantName: true,
          reviews: {
            select: {
              rating: true
            }
          }
        }
      }
    }
  });
  const total = await prisma.providerMeal.count({
    where: {
      AND: andConditions
    }
  });
  return {
    data: result,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};
var getMealById = async (id) => {
  const meal = await prisma.meal.findUnique({
    where: { id },
    include: {
      category: true,
      provider: {
        where: { isAvailable: true },
        select: {
          price: true,
          provider: {
            select: {
              restaurantName: true,
              reviews: {
                select: { rating: true }
              }
            }
          }
        }
      }
    }
  });
  return meal;
};
var getProviders = async () => {
  const providers = await prisma.provider.findMany({
    select: {
      id: true,
      restaurantName: true,
      isOpen: true,
      description: true,
      createdAt: true,
      image: true
    }
  });
  return providers;
};
var getProviderById = async (providerId, categoryName) => {
  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
    select: {
      id: true,
      restaurantName: true,
      description: true,
      isOpen: true,
      image: true,
      cuisineType: true,
      reviews: {
        select: {
          id: true,
          rating: true,
          comment: true,
          user: {
            select: {
              name: true
            }
          }
        }
      },
      meals: {
        where: {
          isAvailable: true,
          ...categoryName && {
            meal: {
              category: {
                name: categoryName
              }
            }
          }
        },
        select: {
          id: true,
          price: true,
          meal: {
            select: {
              id: true,
              name: true,
              description: true,
              category: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      }
    }
  });
  if (!provider)
    return null;
  let totalRating = 0;
  const reviews = provider.reviews.map((review) => {
    review.rating && (totalRating += review.rating);
  });
  const averageRating = provider.reviews.length > 0 ? totalRating / provider.reviews.length : null;
  return {
    ...provider,
    averageRating
  };
};
var mealService = { getAllMeals, getMealById, getProviders, getProviderById };

// src/helpers/pagination.ts
var pagination2 = (options) => {
  const page = options.page ? Number(options.page) : 1;
  const limit = options.limit ? Number(options.limit) : 10;
  const skip = (page - 1) * limit;
  const sortBy = options.sortBy ? options.sortBy : "createdAt";
  const sortOrder = options.sortOrder === "desc" ? "desc" : "asc";
  return { page, skip, limit, sortBy, sortOrder };
};

// src/modules/meals/meals.controller.js
var getAllMeals2 = async (req, res) => {
  try {
    const search = req.query.search;
    console.log("Search query:", search);
    const searchString = typeof search === "string" ? search : void 0;
    const name = req.query.name;
    const description = req.query.description;
    const isAvailable = req.query.isAvailable ? req.query.isAvailable === "true" ? true : false : void 0;
    const category = req.query.category;
    const reviews = req.query.reviews;
    const ratings = Number(req.query.ratings);
    const { page, skip, limit, sortBy, sortOrder } = pagination2(req.query);
    const result = await mealService.getAllMeals({ search: searchString, name, description, isAvailable, category, reviews, ratings, page, skip, limit, sortBy, sortOrder });
    return res.status(200).json({ data: result, message: "Meals fetched successfully" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Something went wrong", error });
  }
};
var getMealById2 = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: "Meal id is required" });
    }
    const result = await mealService.getMealById(id);
    return res.status(200).json({ data: result, message: "Meal fetched ya ya successfully" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Something went wrong", error });
  }
};
var getProviders2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    console.log("userId:", userId);
    const result = await mealService.getProviders();
    console.log(result);
    return res.status(200).json({ data: result, message: "Providers fetched successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong", error });
  }
};
var getProviderById2 = async (req, res) => {
  try {
    const id = req.params.id;
    const CategoryName = req.query.category;
    if (!id) {
      return res.status(400).json({ message: "Provider id is required" });
    }
    const result = await mealService.getProviderById(id, CategoryName);
    return res.status(200).json({ data: result, message: "Provider fetched successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong", error });
  }
};
var mealsController = { getAllMeals: getAllMeals2, getMealById: getMealById2, getProviders: getProviders2, getProviderById: getProviderById2 };

// src/modules/meals/meals.routes.js
var router6 = express6.Router();
router6.get("/", mealsController.getAllMeals);
router6.get(
  "/providers",
  //auth(UserRole.CUSTOMER,UserRole.PROVIDER,UserRole.ADMIN),
  mealsController.getProviders
);
router6.get("/:id", mealsController.getMealById);
router6.get("/providers/:id", mealsController.getProviderById);
var mealsRoutes = router6;

// src/modules/auth/auth.route.js
import express7 from "express";

// src/modules/auth/auth.controller.js


// src/modules/auth/auth.services.ts
import bcrypt from "bcryptjs";
import jwt2 from "jsonwebtoken";
var secret2 = process.env.BETTER_AUTH_SECRET;
var signUp = async (userdata) => {
  const user = await prisma.user.findUnique({
    where: {
      email: userdata.email
    }
  });
  if (user) {
    throw new Error("User already exists");
  }
  const hashedPassword = await bcrypt.hash(userdata.password, 6);
  const newUser = await prisma.user.create({
    data: {
      email: userdata.email,
      password: hashedPassword,
      name: userdata.name
    }
  });
  const { password, ...userData } = newUser;
  return userData;
};
var login = async (userdata) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: userdata.email
    }
  });
  if (!user) {
    throw new Error("User not found");
  }
  const match = await bcrypt.compare(userdata.password, user.password);
  if (!match) {
    throw new Error("Invalid password");
  }
  const userData = {
    id: user.id,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
    email: user.email
  };
  const token = jwt2.sign(userData, secret2, { expiresIn: "1d" });
  return {
    token,
    user
  };
};
var authService = { login, signUp };

// src/modules/auth/auth.controller.js
var signUp2 = async (req, res) => {
  try {
    const result = await authService.signUp(req.body);
    return res.json({
      success: true,
      message: "Signup successful",
      data: result
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message
    });
  }
};
var login2 = async (req, res) => {
  const result = await authService.login(req.body);
  res.cookie("token", result.token, {
    secure: false,
    httpOnly: true,
    sameSite: "strict"
  });
  return res.json({
    success: true,
    message: "Login successful",
    data: result
  });
};
var authController = { login: login2, signUp: signUp2 };

// src/modules/auth/auth.route.js
var router7 = express7.Router();
router7.post("/login", authController.login);
router7.post("/signup", authController.signUp);
var authRoutes = router7;

// src/app.ts
var app = express8();
const PORT = process.env.PORT || process.env.BACKEND_PORT || 3000;
console.log("Better Auth URL:", process.env.BETTER_AUTH_URL);
console.log("App URL:", process.env.APP_URL);
console.log("Database URL:", process.env.DATABASE_URL);
var allowedOrigins = [
  process.env.BETTER_AUTH_URL || "http://localhost:3000",
  process.env.APP_URL
  // Production frontend URL
].filter(Boolean);
app.use(
  cors({
    origin: function(origin, callback) {
      if (!origin || origin.startsWith("http://localhost:3001")) {
        return callback(null, true);
      }
      if (origin === process.env.APP_URL || origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }
      if (origin === `${process.env.APP_URL}` || origin.endsWith("/auth/signup")) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express8.json());
app.use("/provider", providerRoutes);
app.use("/meal", mealsRoutes);
app.use("/order", orderRoutes);
app.use("/admin", adminRoutes);
app.use("/review", reviewRoutes);
app.use("/categories", categoryRoutes);
app.use("/auth", authRoutes);
app.listen((PORT), () => {
  console.log(`Better Auth app listening on port ${PORT}`);
});
var app_default = app;

// src/index.ts
var index_default = app_default;
export {
  index_default as default
};
