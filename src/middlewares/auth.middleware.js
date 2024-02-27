import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import {User} from "../models/user.model.js"


const jwtVerify = asyncHandler(async(req,res,next)=>{
  try {
    const givenToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    if(!givenToken){
      throw new ApiError(401,"error while working with cookies")
    }
    const decodedToken = jwt.verify(givenToken,process.env.ACCESS_TOKEN_SECRET)
    const user = await User.findById(decodedToken._id)?.select("-password -refreshToken")
    if(!user){
      throw new ApiError(401,"Invalid cookies")
    }
    req.user = user
    next()
  } 
  catch (error) {
    throw new ApiError(401,error?.message||"error while working with cookies")
  }

})

export {jwtVerify}