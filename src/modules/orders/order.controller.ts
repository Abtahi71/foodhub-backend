//import { getOrder } from "../../../node_modules/effect/src/Array";
import { Request, Response } from "express";
import { orderServices } from "./order.services";


type cartItem = {
  providerMealId: string;
  quantity: number;
};

type orderItems = {
  customerid: string;
  providerId: string;
  deliveryAddress: string;
  cartItems: cartItem[];
};

const addToCart = async (req: Request, res: Response) => {
  try{
    const providerMealId = req.params.providerMealId;
    const userId = req.user?.id;

    console.log("THIS IS THE PROVIDER MEAL ID",providerMealId)
    console.log("THIS IS THE USER ID",userId)
    const { quantity } = req.body as cartItem;
    const result = await orderServices.addToCart(
      quantity, 
      userId as string,
      providerMealId as string
    );

    
    
    if (typeof result === "string") {
      // result is of type "Meal not found"
      console.log("THIS IS THE RESULT", result);
      res.status(200).json({ message: result });
    } else {
      // result is an object with a message property
      res.status(200).json({ message: result.message, data: result.cartItem });
    }

  }catch(e:any){
    console.error(e);
    res.status(500).json({ message: e.message });
    return;
  }
}

const clearCart = async (req: Request, res: Response) => {
  try{
    const userId = req.user?.id;
    console.log("THIS IS THE USER ID",userId)
    const response = await orderServices.clearCart(
      userId as string
    );
    console.log(response.message)
    res.status(200).json({ message: response.message });

  }catch(e:any){
    console.log(e.message)
    res.status(500).json({ message: "Internal server error" });
    return;
  }
}

const getCart = async (req: Request, res: Response) => {
  try{
    const userId = req.user?.id;
    const result = await orderServices.getCart(
      userId as string
    );
    if(result.cart==null){
      res.status(200).json({ message: "Cart is empty", data: null });
      return;
    }
    res.status(200).json({ message: "Cart fetched successfully", data: result });

  }catch(e){
    res.status(500).json({ message: "Internal server error" });
    return;
  }
}

const checkOutOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    const result = await orderServices.checkOutOrder(
      req.body,
      userId as string,
      
    );
    if(typeof result === "string"){
      res.status(200).json({ message: result });
      return;
    }
    res.status(201).json({ message: "Order created successfully", data: result });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const getOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const result = await orderServices.getOrders(userId as string);
    res
      .status(200)
      .json({ message: "Orders fetched successfully", data: result });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const getOrderDetails = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;
    const userId = req.user?.id;
    const result = await orderServices.getOrderDetails(
      orderId as string,
      userId as string
    );
    res
      .status(200)
      .json({ message: "Order details fetched successfully", data: result });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const getMyOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const result = await orderServices.getMyOrder(userId as string);
    res
      .status(200)
      .json({ message: "Orders fetched successfully", data: result });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const orderController = {getMyOrder, checkOutOrder, getOrders, getOrderDetails,addToCart,getCart,clearCart };
