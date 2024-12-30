import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Subscription } from "../models/subscription.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const {channelId} = req.params
  // TODO: toggle subscription
  try {
    const subscribed = await Subscription.findOne({
      subscriber: req.user._id,
      channel: channelId
    })
    if(subscribed){
      const unsubscribed = await Subscription.deleteOne({_id: subscribed._id})
      if(!unsubscribed){
        throw new ApiError(502,"something wrong while removing subscription")
      }
      return res.status(201).json(new ApiResponse("unsubscribed successfully",201,unsubscribed))
    }
    else{
      const subscribed = new Subscription({channel: channelId,subscriber: req.user._id})
      const savedSubscribed = await subscribed.save()
      if(!savedSubscribed){
        throw new ApiError(502,"something wrong while subscribing")
      }
      return res.status(201).json(new ApiResponse("subscribed successfully",201,savedSubscribed))
    }
  } catch (error) {
    console.error(error)
    throw new ApiError(501,"something wrong while toggling subscription")
  }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const {channelId} = req.params
  const subscribersnchannel = await Subscription.find({channel: channelId})
  if(!subscribers){
    throw new ApiError(502,"something wrong while fetching subscribers")
  }
  const subscribers = subscribersnchannel.map(doc=> doc.subscriber)
  return res.status(201).json(new ApiResponse("User channel subscriberes fetched successfully",201,subscribers))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params
  const subscriberChannel = await Subscription.find({subscriber: subscriberId})
  if(!subscriberChannel){
    throw new ApiError(502,"something wrong while fetching subscribed channels list")
  }
  const channels = subscriberChannel.map(doc=> doc.channel)
  return res.status(201).json(new ApiResponse("subscribed channels fetched successfully",201,channels))
})

export {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels
}