import { Role } from "@prisma/client";
import { Request, Response } from "express";
import { pagination } from "../../helpers/pagination";
import { adminServices } from "./admin.services";
import { sort } from "effect/Chunk";


const getAllUsers = async (req: Request, res: Response) => {
  try {
    // console.log("Received query parameters:", req.query);
    const search = req.query.search;
    // console.log("Search query:", search);
    const searchString = typeof search === "string" ? search : undefined;
    const name = req.query.name as string;

    let role = req.query.userRole as string;
    role = (role?.toUpperCase() as keyof typeof Role) || undefined;
    const isActive = req.query.isActive
      ? req.query.isActive === "true"
        ? true
        : false
      : undefined;
    const { page, skip, limit } = pagination(req.query);

    // console.log("Query parameters:", { search: searchString, name, role, isActive, page, skip, limit });

    const result = await adminServices.getAllUsers({
      search: searchString,
      name,
      role,
      isActive,
      page,
      skip,
      limit,
    });
    // console.log(result)
    res
      .status(200)
      .json({ message: "Users fetched successfully", data: result });
  } catch (e: any) {
    console.log(e.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateRole = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;
    const validRoles = Object.values(Role);

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: `Invalid role. Valid roles are: ${validRoles.join(", ")}`,
      });
    }
    
    const result = await adminServices.updateUserRole(userId as string, role);
    res
      .status(200)
      .json({ message: "User role updated successfully", data: result });
  } catch (e) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const getOrders = async (req: Request, res: Response) => {
  try {
  
    const { page, skip, limit } = pagination(req.query);
    const result = await adminServices.getOrders({ page, skip, limit });
    console.log(result);
    res
      .status(200)
      .json({ message: "Orders fetched successfully", data: result });
  } catch (error: any) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const { status } = req.body;
    const isActive = status === "true" ? true : false;
    const result = await adminServices.updateUserStatus(
      userId as string,
      isActive
    );
    res
      .status(200)
      .json({ message: "User status updated successfully", data: result });
  } catch (e: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: e.message });
  }
};
type SortBy = "rating" | "orderCount" | "createdAt";
type SortOrder = "asc" | "desc";

const getAllProviders = async (req: Request, res: Response) => {

  
  try {
    console.log("PROVIDER ROUTE IN ADMIN IS BEING HIT");
    const { sortBy, sortOrder,minRating,searchTerm } = req.query
    const { page, skip, limit } = pagination(req.query);
    const minRatingNumber = minRating ? Number(minRating) : 0;
    const result = await adminServices.getAllProviders(sortBy as SortBy, sortOrder as SortOrder,minRatingNumber,searchTerm as string, page, limit);
    //console.log("THIS IS THE RESULT IN THE AMDIN CONTROLLER", result);
    res
      .status(200)
      .json({ data: result, message: "Providers fetched successfully" });
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: "Internal server error" });
  }
};

export const adminController = {
  getAllProviders,
  getAllUsers,
  updateRole,
  getOrders,
  updateUserStatus,
};
