import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";


const reviewProvider = async (
  userId: string,
  providerId: string,
  rating?: number,
  comment?: string
) => {
  const isOrdered = await prisma.order.findFirst({
    where: {
      customerId: userId,
      providerId,
    },
  });
  if (!isOrdered)
    throw new AppError(400,"You can only review providers you have ordered from.");
  const existingReview = await prisma.review.findFirst({
    where: {
      userId,
      providerId,
    },
    select: {
      id: true,
    },
  });

  const result = await prisma.review.upsert({
    where: {
      userId_providerId: {
        userId,
        providerId,
      },
    },
    update: {
      rating,
      comment,
    },
    create: {
      userId,
      providerId,
      rating,
      comment,
    },
  });
  if (existingReview)
    return { message: "Review updated successfully", review: result };
  return { message: "Review submitted successfully", review: result };
};

const getMyReviews = async (userId: string, providerId: string) => {
  const reviews = await prisma.review.findFirst({
    where: {
      userId,
      providerId,
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      provider: {
        select: {
          restaurantName: true,
        },
      },
    },
  });
  return reviews;
};

const getAllReviews = async (providerId: string) => {
  const reviews = await prisma.review.findMany({
    where: {
      providerId,
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  });
  return reviews;
};
export const reviewServices = { reviewProvider, getMyReviews, getAllReviews };
