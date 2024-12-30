import { ApiError } from "../utils/ApiError.js";
import { Tweet } from "../models/tweet.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const {content} = req.body;
  const user = req.user;
  if(!content){
    throw new ApiError(401,"either tweet is empty or there is something wrong with tweet")
  }
  const tweet = await Tweet.create(
    {
      content,
      owner : user
    }
  )
  if(!tweet){
    throw new ApiError(501,"something wrong while uploading tweet in db")
  }
  return res.status(201).json(new ApiResponse("tweet uploaded successfully",201,tweet))
})

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const user = req.user
  const tweets = await Tweet.find({owner: user})
  if(!tweets){
    throw new ApiError(502,"something wrong in fetching tweets of user")
  }
  res.status(201).json(new ApiResponse(`tweets of ${user} fetched successfully`,201,tweets))
})

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const {tweetId} = req.params
  const {tweetmsg} = req.body
  if(!tweetmsg) throw new ApiError(401,"something wrong with tweet in updation");
  const tweet = await Tweet.findByIdAndUpdate( tweetId,
    {
      $set: {
        content: tweetmsg
      }
    },
    {
      new: true
    }
  )
  if(!tweet) throw new ApiError(501,"somthing wrong while updating tweet in db");
  return res.status(201).json( new ApiResponse("tweet updated successfully",201))
})

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params
  const tweet = await Tweet.findByIdAndDelete(tweetId)
  if(!tweet) throw new ApiError(501,"something wrong happened while deleting tweet");
  res.status(201).json(new ApiResponse("tweet deleted successfully",201))
})

export {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet
}