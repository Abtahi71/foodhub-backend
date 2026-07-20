import { Request, Response } from "express";
import { reviewServices } from "./reviews.services";
import { catchAsync } from "../../shared/catchAsync";


const reviewProvider =catchAsync (async (req: Request, res: Response) => {
   console.log("THE REVIEW ROUTE IS BEING HIT ")
    const userId = req.user?.id;
    const providerId = req.params.providerId;
    const { rating, comment } = req.body;

    // console.log("userId:", userId);
    // console.log("providerId:", providerId);
    // console.log('This is the rating',rating)
    // console.log('This is the comment',comment)
    const result = await reviewServices.reviewProvider(
      userId!,
      providerId as string,
      rating,
      comment
    );
    // console.log(result)
    return res.status(201).json({ data: result, message: result.message });

})

const getMyReviews = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const providerId = req.params.providerId;

  try {
    const result = await reviewServices.getMyReviews(
      userId!,
      providerId as string
    );
    return res.status(200).json({ data: result });
  } catch (e: any) {
    console.log(e.message);
    return res.status(500).json({ message: e.message });
  }
};

const getAllReviews = async (req: Request, res: Response) => {
  const providerId = req.params.providerId;
  try {
    const result = await reviewServices.getAllReviews(providerId as string);
    // console.log(result)
    return res.status(200).json({ data: result });
  } catch (e: any) {
    console.log(e.message);
    return res.status(500).json({ message: e.message });
  }
};
export const reviewController = { reviewProvider, getMyReviews, getAllReviews };
