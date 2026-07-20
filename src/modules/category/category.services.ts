import { prisma } from "../../lib/prisma";


const getCategories = async () => {
  const categories = await prisma.category.findMany({
    select: {
      name: true,
      id: true,
    },
  });
  return categories;
};

const getCategoryProviders = async (name: string) => {
  const providers = await prisma.provider.findMany({
    where: {
      cuisineType: {
        has: name,
      },
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
  return providers;
};

const getCategoryMeals = async (providerId: string, category?: string) => {
  const meals = await prisma.providerMeal.findMany({
    where: {
      providerId,
      isAvailable: true,
      ...(category && {meal: {
        category: {
          name: category,
        },
      },
    }),},
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
              name: true,
            },
          },
        },
      },
    },
  });
  return meals;
};

export const categoryService = {
  getCategories,
  getCategoryProviders,
  getCategoryMeals,
};
