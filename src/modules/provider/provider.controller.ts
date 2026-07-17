import { Request, Response } from "express";
import cloudinary from "../../config/cloudinary";
import { providerServices } from "./provider.services";


const register = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  console.log("USER ID:", userId);
  if (!userId) {
    return res.status(400).json({ message: "User id is required" });
  }
  try {
    let imageUrl: string | undefined;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "providers",
      });
      imageUrl = result.secure_url;
    }
    const isOpen = req.body.isOpen
      ? req.body.isOpen === "true"
        ? true
        : false
      : true;

    let cuisineTypeArray: string[];
    if (typeof req.body.cuisineType === "string") {
      try {
        const cleanedString = req.body.cuisineType.trim();
        cuisineTypeArray = JSON.parse(cleanedString);
      } catch (error) {
        cuisineTypeArray = req.body.cuisineType
          .split(",")
          .map((item: string) => item.trim());
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
      image: imageUrl,
    };

    const result = await providerServices.register(userId, providerData);
    return res
      .status(201)
      .json({ data: result, message: "Provider registered successfully" });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

const getMyProviders = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const search = req.query.searchTerm as string;
    console.log("this is the search query:", search);
    const result = await providerServices.getMyProviders(
      userId as string,
      search
    );
    //console.log(result);
    return res
      .status(200)
      .json({ data: result, message: "Providers fetched successfully" });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

const getProviderOrders = async (req: Request, res: Response) => {
  const providerId = req.params.providerId;
  //console.log("PROVIDER ID:", providerId);
  // console.log('yayyyyaaaa')
  try {
    const result = await providerServices.getProviderOrders(
      providerId as string
    );
    return res
      .status(200)
      .json({ data: result, message: "Orders fetched successfully" });
  } catch (e: any) {
    console.log(e.message);
    res.status(500).json({ message: e.message });
  }
};

const createMeal = async (req: Request, res: Response) => {
  try {
    //console.log("RAW BODY:", req.body);
    console.log("NAME FIELD:", req.body.name);
    let imageUrl: string | undefined;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "providers",
      });
      imageUrl = result.secure_url;
    }
    const providerId = req.params.id;
    console.log(providerId);
    const isAvailable = req.body.isAvailable
      ? req.body.isAvailable === "true"
        ? true
        : false
      : true;
    const result = await providerServices.createMeal(
      req.body,
      imageUrl,
      providerId as string,
      isAvailable
    );
    return res
      .status(201)
      .json({ data: result, message: "Meal created successfully" });
  } catch (e: any) {
    console.log(e);
    res.status(500).json({ message: e.message });
  }
};

const updateMeal = async (req: Request, res: Response) => {
  try {
    const mealId = req.params.id;
    let imageUrl: string | undefined;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "providers",
      });
      imageUrl = result.secure_url;
    }
    //console.log("RAW BODY:", req.body);
    console.log(typeof req.body.isAvailable, req.body.isAvailable);
    const isAvailable = req.body.isAvailable
      ? req.body.isAvailable === "true"
        ? true
        : false
      : undefined;
    const updatedData = {
      ...req.body,
      isAvailable: isAvailable,
      image: imageUrl,
    };
    const result = await providerServices.updateMeal(
      updatedData,
      mealId as string
    );
    return res
      .status(200)
      .json({ data: result, message: "Meal updated successfully" });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

const deleteMeal = async (req: Request, res: Response) => {
  const providerId = req.user?.id;
  const mealId = req.params.id;

  console.log(providerId, mealId);
  try {
    await providerServices.deleteMeal(mealId as string, providerId as string);
    return res.status(200).json({ message: "Meal deleted successfully" });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

const getAllProviders = async (req: Request, res: Response) => {
  try {
    const result = await providerServices.getAllProviders();
    return res
      .status(200)
      .json({ data: result, message: "Providers fetched successfully" });
  } catch (e) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const getProviderMeals = async (req: Request, res: Response) => {
  const providerId = req.params.id;
  try {
    const result = await providerServices.getProviderMeals(
      providerId as string
    );
    return res
      .status(200)
      .json({ data: result, message: "Meals fetched successfully" });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

const updateOrderStatus = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const orderId = req.params.id;
  const { status } = req.body;
  const validStatuses = ["PENDING", "ON_THE_WAY", "PREPARING", "DELIVERED"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  try {
    const result = await providerServices.updateOrderStatus(
      orderId as string,
      status,
      userId as string
    );
    return res
      .status(200)
      .json({ data: result, message: "Order status updated successfully" });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

const updateProvider = async (req: Request, res: Response) => {
  const providerId = req.params.id;
  const userId = req.user?.id;

  console.log(providerId, userId);

  try {
    let imageUrl: string | undefined;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "providers",
      });
      imageUrl = result.secure_url;
    }
    const isOpen = req.body.isOpen
      ? req.body.isOpen === "true"
        ? true
        : false
      : true;

    let cuisineTypeArray: string[];
    if (typeof req.body.cuisineType === "string") {
      try {
        const cleanedString = req.body.cuisineType.trim();
        cuisineTypeArray = JSON.parse(cleanedString);
      } catch (error) {
        cuisineTypeArray = req.body.cuisineType
          .split(",")
          .map((item: string) => item.trim());
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
      image: imageUrl,
    };

    const result = await providerServices.updateProvider(
      providerId as string,
      providerData
    );
    return res
      .status(200)
      .json({ data: result, message: "Provider updated successfully" });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};
export const providerController = {
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
