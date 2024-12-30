import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
 
const toggleVideoLike = asyncHandler(async (req, res) => {
  const {videoId} = req.params
  const userId = req.user._id
  //TODO: toggle like on video
  try {
    const liked = await Like.findOne({videoId,userId})
    if(liked){
      const like = await Like.findByIdAndDelete(liked._id)
      if(!like) throw new ApiError(402,"something wrong while removing like");
      return res.status(201).json(new ApiResponse("like removed successfully",201))
    }
    else{
      const like = new Like({
        video: videoId,
        likedBy: userId
      })
      const savedLike = await like.save();
      if(!savedLike) throw new ApiError(501,"something wrong while saving like in db");
      res.status(201).json(new ApiResponse("video liked successfully",201))
    }
  } catch (error) {
    console.log("Error : ",error)
  }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
  const {commentId} = req.params
  //TODO: toggle like on comment
  const userId = req.user._id
  try {
    const liked = await Like.findOne({commentId,userId})
    if(liked){
      const like = await Like.findByIdAndDelete(liked._id)
      if(!like) throw new ApiError(402,"something wrong while removing like")
      return res.status(201).json(new ApiResponse("like removed successfully",201))
    }
    else{
      const like = new Like({
        comment: commentId,
        likedBy: userId
      })
      const savedLike = await like.save();
      if(!savedLike) throw new ApiError(501,"something wrong while saving like in db");
      res.status(201).json(new ApiResponse("comment liked successfully",201))
    }
  } catch (error) {
    console.log("Error : ",error)
  }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
  const {tweetId} = req.params
  //TODO: toggle like on tweet
  const userId = req.user._id
  try {
    const liked = await Like.findOne({tweetId,userId})
    if(liked){
      const like = await Like.findByIdAndDelete(liked._id)
      if(!like) throw new ApiError(402,"something wrong while removing like")
      return res.status(201).json(new ApiResponse("like removed successfully",201))
    }
    else{
      const like = new Like({
        tweet: tweetId,
        likedBy: userId
      })
      const savedLike = await like.save();
      if(!savedLike) throw new ApiError(501,"something wrong while saving like in db");
      res.status(201).json(new ApiResponse("tweet liked successfully",201))
    }
  } catch (error) {
    console.log("Error : ",error)
  }
})

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const userId = req.user._id
  const likedVideos = await Like.find({likedBy: userId}).populate('video')
  if(!likedVideos){
    throw new ApiError(405,"something wrong while fetching liked videos or no videos found")
  }
  console.log(`likedVideos fetched: ${likedVideos}`)
  const likedVideosUrls = likedVideos.map(like => like.video.videofile)
  return res.status(201).json(new ApiResponse("liked videos fetched successfully"))
})

export {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos
}