import { Role } from "@prisma/client";
import { prisma } from "../../lib/prisma";


const getAllUsers = async ({
  search,
  name,
  role,
  isActive,
  page,
  skip = 0,
  limit = 10,
  sortBy = "createdAt",
  sortOrder = "desc",
}: {
  search?: string;
  name?: string;
  role?: string;
  isActive?: boolean;
  page?: number;
  skip?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) => {
  const andConditions: any[] = [];

  if (search) {
    andConditions.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    });
  }
  if (role) {
    andConditions.push({
      role: role,
    });
  }
  if (isActive !== undefined) {
    andConditions.push({
      isActive,
    });
  }

  const users = await prisma.user.findMany({
    take: limit,
    skip,
    where: {
      AND: andConditions,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      isActive: true,
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const total = await prisma.user.count({
    where: { AND: andConditions },
  });

  const userWithOrderCounts = await Promise.all(
    users.map(async (user: any) => {
      const orderCount = await prisma.order.count({
        where: {
          customerId: user.id,
        },
      });
      return {
        ...user,
        orderCount,
      };
    })
  );
  return {
    userWithOrderCounts,
    pagination: {
      total,
      page: page || 1,
      limit: limit || 10,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page ? page : 1 < Math.ceil(total / limit),
      hasPrevPage: page ? page : 1 > 1,
    },
  };
};

const getOrders = async ({
  page,
  skip = 0,
  limit = 10,
}: {
  page?: number;
  skip?: number;
  limit?: number;
}) => {
  const orders = await prisma.order.findMany({
    select: {
      id: true,
      totalAmount: true,
      createdAt: true,
      contact: true,
      status: true,
      provider: {
        select: {
          restaurantName: true,
        },
      },
      customer: {
        select: {
          name: true,
          email: true,
        },
      },
    },
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
      hasPrevPage: page ? page : 1 > 1,
    },
  };
};

const updateUserRole = async (userId: string, role: Role) => {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      role: role,
    },
  });
  return {
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
  };
};

const updateUserStatus = async (userId: string, isActive: boolean) => {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      isActive: isActive,
    },
  });
  return {
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    isActive: updatedUser.isActive,
  };
};

export const adminServices = {
  getAllUsers,
  updateUserRole,
  getOrders,
  updateUserStatus,
};
