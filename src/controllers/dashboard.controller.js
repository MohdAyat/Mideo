import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const ownerId = req.user._id
  const totalSubscribers = await Subscription.countDocuments({channel: ownerId})
  if(!totalSubscribers){
    throw new ApiError(502,"something wrong while fetching subcribers count")
  }
  const totalVideos = await Video.countDocuments({owner: ownerId})
  if(!totalVideos){
    throw new ApiError(502,"something wrong while fetching videos count")
  }

  const user = await User.findById(ownerId)
  if(!user){
    throw new ApiError(502,"something wrong while fetching user details")
  }

  const channelCreationDate = user.createdAt
  try {
    const totalViewsQuery = await Video.aggregate([
      {
        "$match": {owner: ownerId}
      },
      {
        "$group": { _id: null,totalViews: {$sum: "$views"}}
      }
    ])
    
    const totalViews = totalViewsQuery.length >0 ? totalViewsQuery[0].totalViews : 0;
    
    const totalLikesQuery = await Videos.aggregate([
      { "$match" : {owner: ownerId}},
      {
        "$lookup" : {
          "from" : "",
          "localField": "_id",
          "foreignFeild": "video",
          "as": "likes"
        }
      },
      {
        "$unwind" : "$likes"
      },
      {
        "$group" : {
          "_id": "$owner",
          "totalLikes": {"$sum": 1}
        }
      }
    ])
    const totalLikes = totalLikesQuery.length >0 ? totalLikesQuery[0].totalLikes : 0;
  } catch (error) {
    throw new ApiError(501,"something wrong while fetching channel stats")
  }
  
  
  return res.status(201).json(new ApiResponse("total subscribers,total videos,total views,channel creation date and total likes fetched successfully",201,{totalSubscribers,totalVideos,totalViews,channelCreationDate,totalLikes}))
})

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const ownerId = req.user._id
  const videos = await Video.find({owner: ownerId})
  if(!videos){
    throw new ApiError(502,"something wrong while fetching videos of this channel")
  }
  return res.status(201).json(new ApiResponse("channel videos fetched successfully",201,videos))
})

export {
  getChannelStats, 
  getChannelVideos
  }

  