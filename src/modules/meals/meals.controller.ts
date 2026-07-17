
import { Request, Response } from "express";
import { pagination } from "../../helpers/pagination";
import { mealService } from "./meals.service";



const getAllMeals = async(req:Request,res:Response)=>{
    try{
    const search = req.query.search
    console.log("Search query:", search)
    const searchString = typeof search ==='string'?search:undefined
    const name = req.query.name as string
    const description = req.query.description as string
    const isAvailable = req.query.isAvailable?(req.query.isAvailable==='true'?true:false):undefined
    const category = req.query.category as string
    const reviews = req.query.reviews as string
    const ratings = Number(req.query.ratings)
    const {page,skip,limit,sortBy,sortOrder} = pagination(req.query)


    const result = await mealService.getAllMeals({search:searchString,name,description,isAvailable,category,reviews,ratings,page,skip,limit,sortBy,sortOrder}) 
   // console.log(result) 
    return res.status(200).json({data:result,message:'Meals fetched successfully'})

    }
    catch(error:any){
        console.log(error.message)
        return res.status(500).json({message:'Something went wrong',error}) 
    }
}

const getMealById = async(req:Request,res:Response)=>{
    try{
    const id = req.params.id
    if(!id){
        return res.status(400).json({message:'Meal id is required'})
    }
    const result = await mealService.getMealById(id as string)
    return res.status(200).json({data:result,message:'Meal fetched ya ya successfully'})
    

    }catch(error:any){
        console.log(error.message)
        return res.status(500).json({message:'Something went wrong',error}) 
    }
}

const getProviders = async(req:Request,res:Response)=>{
    try{
      const userId = req.user?.id
      console.log("userId:", userId)
      const result = await mealService.getProviders()
      //console.log(result)
      return res.status(200).json({data:result,message:'Providers fetched successfully'})
    }
    catch(error){
        return res.status(500).json({message:'Something went wrong',error}) 
    }
}

const getProviderById = async(req:Request,res:Response)=>{
    try{
      const id = req.params.id
      const CategoryName = req.query.category as string
      if(!id){
        return res.status(400).json({message:'Provider id is required'})
      }

      const result = await mealService.getProviderById(id as string,CategoryName as string) 
      return res.status(200).json({data:result,message:'Provider fetched successfully'})
    }
    catch(error){
        return res.status(500).json({message:'Something went wrong',error}) 
    }
}
export const mealsController = {getAllMeals,getMealById,getProviders,getProviderById};