import { prisma } from "../../lib/prisma";


const addToCart = async (
  quantity: number,
  userId: string,
  providerMealId: string
) => {
  let message = "";
  const providerMeal = await prisma.providerMeal.findUnique({
    where: {
      id: providerMealId,
    },
  });
  if (!providerMeal || !providerMeal.isAvailable) {
    return (message = "Meal not found");
  }

  const existingCart = await prisma.cart.findUnique({
    where: {
      userId,
    },
    select: {
      providerId: true,
    },
  });

  if (existingCart && existingCart.providerId !== providerMeal.providerId) {
    return (message =
      "You can only add items from one restaurant at a time. Clear your cart first?");
  } else {
    message = "Items added to cart successfully";
  }

  const cart = await prisma.cart.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      providerId: providerMeal.providerId,
    },
  });

  const cart2 = await prisma.cartItem.upsert({
    where: {
      cartId_providerMealId: {
        cartId: cart.id,
        providerMealId: providerMealId,
      },
    },
    update: {
      quantity: { increment: quantity },
    },
    create: {
      cartId: cart.id,
      providerMealId: providerMealId,
      quantity: quantity,
    },
  });
  return { message, cartItem: cart2 };
};

const clearCart = async (userId: string) => {
  const cart = await prisma.cart.findUnique({
    where: {
      userId,
    },
  });
  if (cart) {
    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });
    await prisma.cart.delete({
      where: {
        id: cart.id,
      },
    });
    return { message: "Cart cleared successfully" };
  } else {
    return { message: "Cart is already empty" };
  }
};

const getCart = async (userId: string) => {
  const cart = await prisma.cart.findUnique({
    where: {
      userId,
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
                  description: true,
                },
              },
              provider: {
                select: {
                  restaurantName: true,
                },
              },
              price: true,
              image: true,
            },
          },
          quantity: true,
        },
      },
    },
  });
  let totalAmount = 0;

  if (!cart || cart.items.length === 0) {
    return { cart: null, totalAmount: 0 };
  }

  const orderItems = cart.items.map((item: any) => {
    totalAmount += item.quantity * item.providerMeal.price;
  });
  return { cart, totalAmount };
};

const checkOutOrder = async (
  orderData: {
    deliveryAddress: string;
    paymentMethod?: string;
    contact: string;
  },
  userId: string
) => {
  let message = "";
  const cart = await prisma.cart.findUnique({
    where: {
      userId,
    },
    select: {
      id: true,
      providerId: true,
      items: {
        include: {
          providerMeal: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    return (message = "Cart is empty");
  }
  let totalAmount = 0;

  const orderItems = cart.items.map((item: any) => {
    totalAmount += item.quantity * item.providerMeal.price;

    return {
      Providermeal: {
        connect: { id: item.providerMealId },
      },
      quantity: item.quantity,
      price: item.providerMeal.price,
    };
  });

  const order = await prisma.$transaction(async (tx: any) => {
    const newOrder = await tx.order.create({
      data: {
        customerId: userId,
        providerId: cart.providerId,
        totalAmount,
        deliveryAddress: orderData.deliveryAddress,
        paymentMethod: orderData.paymentMethod,
        contact: orderData.contact,
        items: {
          create: orderItems,
        },
      },
    });
    await tx.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });
    await tx.cart.delete({
      where: {
        id: cart.id,
      },
    });
    return newOrder;
  });
  return order;
};

const getOrders = async (userId: string) => {
  const result = await prisma.order.findMany({
    where: {
      customerId: userId,
    },
    include: {
      items: {
        include: {
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
      provider: {
        select: {
          restaurantName: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const aggregate = await prisma.order.aggregate({
    where: {
      customerId: userId,
    },
    _sum: {
      totalAmount: true,
    },
  });

  return {
    result,
    totalAmount: aggregate._sum.totalAmount,
  };
};

const getOrderDetails = async (orderId: string, userId: string) => {
  const result = await prisma.order.findFirst({
    where: {
      id: orderId,
      customerId: userId,
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
                  description: true,
                },
              },
            },
          },
        },
      },
      provider: {
        select: {
          restaurantName: true,
        },
      },
    },
  });

  return result;
};

const getMyOrder = async (userId: string) => {
  const order = await prisma.order.findMany({
    where:{
      customerId: userId,
      status:{
        not: "DELIVERED"
      }
    },
    select:{
      id: true,
      totalAmount: true,
      createdAt: true,
      status: true,
      provider: {
        select: {
          restaurantName: true
        }
      },
      items: {
        select: {
          Providermeal: {
            select: {
              price:true,
              meal:{
                select:{
                  name:true
                }
              }
            }
          },
          quantity: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  })
  return order
}

export const orderServices = {
  getMyOrder,
  checkOutOrder,
  getOrders,
  getOrderDetails,
  addToCart,
  getCart,
  clearCart,
};
