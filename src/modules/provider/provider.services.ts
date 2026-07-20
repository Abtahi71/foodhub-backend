import { OrderStatus, Role } from "@prisma/client";
import { prisma } from "../../lib/prisma";
//import { OrderStatus } from "@prisma/enums";


const register = async (
  userId: string,
  providerData: {
    restaurantName: string;
    description: string;

    address: string;
    phone: string;
    website: string;
    isOpen: boolean;
    cuisineType: string[];
    image?: string;
  }
) => {
  const existingProvider = await prisma.provider.findFirst({
    where: { userId },
  });
  if (!existingProvider) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        role: Role.PROVIDER,
      },
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
          id: userId,
        },
      },
    },
  });
  return provider;
};

const getMyProviders = async (userId: string, search?: string) => {
  const totalRevenue = await prisma.order.aggregate({
    where: {
      provider: {
        userId,
        restaurantName: search
          ? {
              contains: search,
              mode: "insensitive",
            }
          : undefined,
      },

      status: OrderStatus.DELIVERED,
    },
    _sum: {
      totalAmount: true,
    },
  });
  const providers = await prisma.provider.findMany({
    where: {
      userId,
      restaurantName: search
        ? {
            contains: search,
            mode: "insensitive",
          }
        : undefined,
    },
    select: {
      id: true,
      restaurantName: true,
      address: true,
      isOpen: true,
      image: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  const result = {
    totalRevenue: totalRevenue._sum.totalAmount || 0,
    providers,
  };
  return result;
};
const createMeal = async (
  mealData: {
    name: string;
    description: string;
    price: number;
    category: string;
  },
  imageUrl: string | undefined,
  providerId: string,
  isAvailable: boolean
) => {
  const category = mealData.category.toLowerCase();

  // const provider  = await  prisma.provider.findFirst({
  //   where:{userId:providerId},
  //   select:{id:true}
  // })

  // if (!provider) {
  //   throw new Error("You are not registered as a provider");
  // }

  return prisma.$transaction(async (tx: any) => {
    const meal = await tx.meal.create({
      data: {
        name: mealData.name,
        description: mealData.description,

        category: {
          connectOrCreate: {
            where: { name: category },
            create: { name: category },
          },
        },
      },
      include: {
        provider: true,
        category: true,
      },
    });
    const providerMeal = await tx.providerMeal.create({
      data: {
        mealId: meal.id,
        providerId: providerId,
        isAvailable: isAvailable,
        price: Number(mealData.price),
        image: imageUrl,
      },
    });
    return { meal, providerMeal };
  });
};

const updateMeal = async (
  mealData: {
    name?: string;
    description?: string;
    price?: number;
    category?: string;
    isAvailable: boolean;
    image?: string;
  },
  mealId: string
) => {
  const existingRecord = await prisma.providerMeal.findUnique({
    where: {
      id: mealId,
    },
  });

  if (!existingRecord) {
    throw new Error(`This Meal is not found for this provider`);
  }
  const result = await prisma.providerMeal.update({
    where: { id: mealId },
    data: {
      ...(mealData.isAvailable !== undefined && {
        isAvailable: mealData.isAvailable,
      }),
      ...(mealData.price !== undefined && {
        price: mealData.price,
      }),
      ...(mealData.image !== undefined && {
        image: mealData.image,
      }),
      meal: {
        update: {
          ...(mealData.name && { name: mealData.name }),
          ...(mealData.description && { description: mealData.description }),
          ...(mealData.category && {
            category: {
              connectOrCreate: {
                where: { name: mealData.category.toLowerCase() },
                create: { name: mealData.category.toLowerCase() },
              },
            },
          }),
        },
      },
    },
  });

  return result;
};

const deleteMeal = async (mealId: string, providerId: string) => {
  const providerMeal = await prisma.providerMeal.findFirst({
    where: { id: mealId },
  });

  if (!providerMeal) {
    throw new Error("Meal not found");
  }
  const provider = await prisma.provider.findFirst({
    where: {
      id: providerMeal?.providerId,
      userId: providerId,
    },
  });

  if (!provider) {
    throw new Error("You are not authorized to delete this meal");
  }
  console.log(provider?.id);
  console.log(mealId);
  return prisma.$transaction(async (tx: any) => {
    const meal = await tx.providerMeal.findUnique({
      where: {
        id: mealId,
      },
    });
    if (!meal) {
      throw new Error("Meal not found or you are not the provider");
    }
    await tx.providerMeal.delete({
      where: {
        id: mealId,
      },
    });
  });
};

const getAllProviders = async () => {
  return await prisma.provider.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      meals: {
        where: {
          isAvailable: true,
        },
        include: {
          meal: true,
        },
      },
    },
  });
};

const getProviderMeals = async (providerId: string) => {
  return await prisma.provider.findUnique({
    where: {
      id: providerId,
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
                  name: true,
                },
              },
            },
          },
          price: true,
          isAvailable: true,
        },
      },
    },
  });
};

const updateOrderStatus = async (
  orderId: string,
  newStatus: OrderStatus,
  userId: string
) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      provider: true,
    },
  });
  if (!order) {
    throw new Error("Order not found");
  }
  if (order.provider.userId !== userId) {
    throw new Error("You are not the provider for this order");
  }
  let updatedOrder
  
    updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: newStatus,
    },
  });
  return updatedOrder;
};

const getProviderOrders = async (providerId: string) => {
  const orders = await prisma.order.findMany({
    where: {
      providerId,
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
                  description: true,
                },
              },
            },
          },
        },
      },
      customer: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
  return orders;
};

const updateProvider = async (
  providerId: string,
  providerData: {
    restaurantName?: string;
    description?: string;

    address?: string;
    phone?: string;
    website?: string;
    isOpen?: boolean;
    cuisineType?: string[];
    image?: string;
  }
) => {
  const updatedProvider = await prisma.provider.update({
    where: { id: providerId },
    data: providerData,
  });
  return updatedProvider;
};

export const providerServices = {
  updateProvider,
  getProviderOrders,
  getMyProviders,
  updateOrderStatus,
  getProviderMeals,
  createMeal,
  updateMeal,
  register,
  deleteMeal,
  getAllProviders,
};
