import { Request, Response } from "express";
import { categoryService } from "./category.services";




const getCategories = async(req:Request,res:Response)=>{
    try{
        const result = await categoryService.getCategories();
        return res.json({categories:result})
    }catch(e:any){
        console.error(e);
        return res.status(500).json({error:e.message})
    }
}

const getCategoryProviders = async(req:Request,res:Response)=>{
    try{
        const {name} = req.params;
        const result = await categoryService.getCategoryProviders(name as string);
        return res.json({result})

    }catch(e:any){
        console.error(e);
        return res.status(500).json({error:e.message})
    }
}

const getCategoryMeals = async(req:Request,res:Response)=>{
    try{
        const {name,providerId} = req.params;
        console.log(name,providerId)
        
        if(!providerId){
            return res.status(400).json({error:"providerId query parameter is required"})
        }
        const result = await categoryService.getCategoryMeals(providerId as string,name as string);
        return res.json({result})

    }catch(e:any){
        console.error(e);
        return res.status(500).json({error:e.message})
    }
}
export const categoryController = {getCategories,getCategoryProviders,getCategoryMeals}