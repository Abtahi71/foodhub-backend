import { Request, Response } from "express";
import { authService } from "./auth.services";


const signUp = async(req: Request, res: Response) => {
    try{
        const result = await authService.signUp(req.body)
        return res.json({
            success:true,
            message:"Signup successful",
            data:result
        })
    }catch(error:any){
        return res.json({
            success:false,
            message:error.message,
        })
    }
}
const login = async(req: Request, res: Response) => {
    try{
        const result = await authService.login(req.body)
       // console.log('THIS IS THE USER IN BACKNED',result)

    res.cookie("token", result.token, {
        secure:true,
        httpOnly:true,
        sameSite:"none"
    })
    return res.json({
        success:true,
        message:"Login successful",
        data:result
    })
    }catch(error:any){
        console.log(error.message)
        return res.json({
            success:false,
            message:error.message,
        })

    }
    
};

const getMe = async(req:Request,res:Response)=>{
    const user = req.user?.id
    console.log('this',user)
    if(!user){
        return res.json(null)
    }
    const me = await authService.getMe(user as string)
    const data = await me
    console.log(data)
    return res.json(data)
}

export const authController = {login,signUp,getMe}
