import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import cookieParser from "cookie-parser";
import { jwtVerify } from "../middlewares/auth.middleware.js";

async function generateAccessandRefreshToken(userid){
  try {
    const user = await User.findById(userid)
    const accessToken = await user.generateAccessToken()
    const refreshToken = await user.generateRefreshToken()
    await user.save({ validateBeforeSave: false })
    return {accessToken,refreshToken}
  } catch (error) {
    throw new ApiError(500,"error while generating tokens",error)
  }
}

const registerUser = asyncHandler(async function (req,res){
  // get userdetails from frontend
  // validate those details
  // check if user already exists or not
  // check for image(compulsory),coverImage
  // take them and upload on cloudinary
  // create user object(create entry in DB)
  // return response without password and reftoken

  const {username,fullname,email,password} = req.body
  if(
    [username,fullname,email,password].some((field)=> field?.trim()==="")
  ){
    throw new ApiError(400,'all fields are required')
  }

  const userExists = await User.findOne({
    $or:[{ username },{ email }]
  })
  if (userExists) {
    throw new ApiError(409,"user with email or username already exists")
  }

  
  let avatarlocalfilepath = req.files?.avatar[0]?.path
  let coverImagelocalfilepath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0){

    coverImagelocalfilepath = req.files?.coverImage[0]?.path
  }
  if(!avatarlocalfilepath) throw new ApiError(400,"Avatar is required");
  const avatar = await uploadOnCloudinary(avatarlocalfilepath)
  const coverImage = await uploadOnCloudinary(coverImagelocalfilepath)
  if(!avatar) throw new ApiError(400,"avatar is required!!");


  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage.url || "",
    email,
    password,
    username: username.toLowerCase()
  })

  const createdUser = await User.findById(user._id).select("-password -refreshToken")
  if(!createdUser) throw new ApiError(500,"something went wrong while registering")

  return res.status(201).json(new ApiResponse("user registered successfully",201,createdUser));

})


const loginUser = asyncHandler(async function(req,res){
  const {username,email,password} = req.body
  // console.log("ayat");
  if(!(username || email)){
    throw new ApiError(400,"username or email is required")
  }

  const user = await User.findOne({
    $or : [{username},{email}]
  })

  if(!user){
    throw new ApiError(404,"user not found please register first")
  }
  
  const passwordIsCorrect = await user.isPasswordCorrect(password)
  if(!passwordIsCorrect){
    throw new ApiError(400,"password is incorrect")
  }

  const {accessToken,refreshToken} = await generateAccessandRefreshToken(user._id)
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )
  const options = {
    httpOnly : true,
    secure: true
  }
  res.status(201)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json( new ApiResponse(
    "User logged in successfully",
    201,
    {user:loggedInUser,accessToken,refreshToken}
    ))
})


const logoutUser = asyncHandler(async(req,res)=>{
  await User.findByIdAndUpdate(req.user._id,
    {
      $set:{refreshToken : undefined}
    },
    {
      new: true
    })

    const options = {
      httpOnly : true,
      secure: true
    }

    res.status(201)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse("user loggedOut",201,{}))
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
  //take refreshToken from cookies 
  //verify
  //give it new accesstoken
  try {
    const givenRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken
    if(!givenRefreshToken){
      throw new ApiError(400,"unauthorized request")
    }
    const decodedToken = jwt.verify(givenRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    const user = await User.findById(decodedToken._id)
    if(!user){
      throw new ApiError(401,"user not found")
    }
    if(givenRefreshToken !== user.refreshToken){
      throw new ApiError(401,"refresh token not matched")
    }
    const {accessToken,refreshToken} = await user.generateAccessandRefreshToken(user._id)
  
    const options = {
      httpOnly : true,
      secure: true
    }
  
    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse("token refreshed successfully",200,{accessToken,refreshToken}))
  } catch (error) {
    console.log("Error while refreshing token :",error);
  }
})

const changePassword = asyncHandler(async(req,res)=>{
  //verify if loggedin or not
  //old password lo and new password lo
  //new password update krdo
  const {oldpassword, newPassword,confirmPassword} = req.body
  if(!oldpassword || !newPassword || !confirmPassword){
    throw new ApiError(401,"all fields are required")
  }
  if(newPassword!==confirmPassword){
    throw new ApiError(401,"new and confirm password should be equal")
  }
  const user = await User.findById(req.user._id)
  const isPasswordValid = await user.isPasswordCorrect(oldpassword)
  if(!isPasswordValid){
    throw new ApiError(401,"password is incorrect")
  }
  user.password = newPassword
  await user.save({validateBeforeSave:false})
  return res.status(201)
  .json(
    new ApiResponse("password changed",201,{})
  )
})

const getUser = asyncHandler(async(req,res)=>{
  return res.status(201).json(new ApiResponse("user fetched",201,req.user))
})

const updateUserDetails = asyncHandler(async(req,res)=>{
  //if user is loggedin or not
  //take details and check
  //update in db
  const {fullname,email} = req.body
  if(!fullname){
    throw new ApiError(401,"fullname is required")
  }
  if(!email){
    throw new ApiError(401,"email is required")
  }
  const user = await User.findByIdAndUpdate(req.user._id,
    {
      $set:{username,email}
    },
    {
      new: true
    }
  ).select("-password")
  return res.status(201).json(new ApiResponse("details updated successfully",201,user))
})

const updateAvatar = asyncHandler(async(req,res)=>{
  //loggediin or not 
  //take avatar through multer
  //upload on cloudinary
  //update the url in db
  const avatarlocalfilepath = req.file?.path
  if(!avatarlocalfilepath){
    throw new ApiError(401,"file not found")
  }
  const newAvatar = await uploadOnCloudinary(avatarlocalfilepath)
  if(!newAvatar.url){
    throw new ApiError(400,"error while uploading avatar")
  }
  const user = await User.findByIdAndUpdate(req.user._id,
    {
      $set:{avatar: newAvatar.url}
    },
    {new:true}
    ).select("-password")

    return res.status(200).json(new ApiResponse("avatar updated successfully",200,user))
})

const updateCoverImage = asyncHandler(async(req,res)=>{
  //loggediin or not 
  //take avatar through multer
  //upload on cloudinary
  //update the url in db
  const coverLocalfilepath = req.file?.path
  if(!coverLocalfilepath){
    throw new ApiError(401,"file not found")
  }
  const newCover = await uploadOnCloudinary(coverLocalfilepath)
  if(!newCover.url){
    throw new ApiError(400,"error while uploading avatar")
  }
  const user = await User.findByIdAndUpdate(req.user._id,
    {
      $set:{coverImage: newCover.url}
    },
    {new:true}
    ).select("-password")

    return res.status(200).json(new ApiResponse("cover image updated successfully",200,user))
})

// print krwakr dekhna h channel ko subscriber etc ko
const getUserChannelProfile = asyncHandler(async(req,res)=>{
  const {username} = req.params
  if(!username){
    throw new ApiError(401,"username not found")
  }
  const channelInfo = User.aggregate([
    {
      $match: {username: username?.toLowerCase()}
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers"
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedChannels"
      }
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribers"
        },
        subscribedChannelsCount: {
          $size: "$subscribedChannels"
        },
        isSubscribed: {
          if: {$in:[req.user?._id,"$subscribers.subscriber"]},
          then: true,
          else: false
        }
      }
    },
    {
      $project: {
        fullname:1,
        username:1,
        subscribedChannelsCount:1,
        subscriberCount:1,
        avatar:1,
        coverImage : 1
      }
    }
  ])
  if(!channel?.length) throw new ApiError(500,"error while fetching data of the channel");
  return res.status(201).json(new ApiResponse("channel data fetched successfully",201,channel[0]))
})

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getUser,
  updateUserDetails,
  updateAvatar,
  updateCoverImage
}