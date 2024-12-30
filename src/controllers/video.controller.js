import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { Video } from "../models/video.model.js"



const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sortBy, sortType, userId } = req.query
  //TODO: get all videos based on query, sort, pagination
  let sort = {}
  if(sortType){
    sort[sortBy] = sortType === 'desc' ? -1 : 1
  }
  const options = {
    page: parseInt(page,10),
    limit : parseInt(limit,10)
  }
  const videosByCriteria = await Video.find({owner: userId})
  .sort(sort)
  .skip((options.page-1)*options.limit)
  .limit(options.limit)

  if(!videosByCriteria){
    throw new ApiError(501,"something wrong while fetching videos")
  }
  return res.status(201).json(new ApiResponse("videos fetched successfully",201,videosByCriteria))
})

const publishAVideo = asyncHandler(async (req, res) => {
  // TODO: get video, upload to cloudinary, create video
  const { title, description} = req.body
  if(!title || !description){
    throw new ApiError(401,"title or description is required")
  }
  // console.log(req.files)
  const user = req.user
  const videoFilePath = req.files?.videoFile[0]?.path
  if(!videoFilePath){
    throw new ApiError(401,"video not found")
  }
  const thumbnailPath = req.files?.thumbnail[0]?.path
  if(!thumbnailPath){
    throw new ApiError(401,"thumbnail not found")
  }
  const videoFile = await uploadOnCloudinary(videoFilePath)
  if(!videoFile) throw new ApiError(501,"error while processing or uploading video")
  
  const thumbnail = await uploadOnCloudinary(thumbnailPath)
  if(!thumbnail) throw new ApiError(501,"error while processing or uploading thumbnail")

// Creating a new video entry in the database with associated file uploads like video file and thumbnail image.
  const video =await Video.create({
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    owner: user,
    title,
    description
  })
  if(!video){
    throw new ApiError(501,"something wrong while uploading video to db")
  }
  return res.status(201).json(new ApiResponse("video published successfully",201,video))
})

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  //TODO: get video by id
  if(!videoId) throw new ApiError(501,"video id not found")
  const video = await Video.findById(videoId)
  if(!video) throw new ApiError(404,"video not found")
  // console.log("ayat");
  // console.log(video);
  return res.status(201).json(new ApiResponse("video fetched",201,video))
})

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  //TODO: update video details like title, description, thumbnail
  const {title,description} = req.body

  if(!title || !description){
    throw new ApiError(401,"title and description is required")
  }
  const user = req.user
  const thumbnailPath = req.file?.path
  if(!thumbnailPath){
    throw new ApiError(401,"thumbnail not found")
  }
  const thumbnail = await uploadOnCloudinary(thumbnailPath)
  if(!thumbnail) throw new ApiError(501,"error while processing or uploading thumbnail")

  const video = await Video.findByIdAndUpdate(videoId,
    {
      $set: {
        title,
        description,
        thumbnail: thumbnail.url
      }
    },
    {
      new: true
    }
    ).select("-views -duration -isPublished")
    if(!video) throw new ApiError(404,"error while updating video details")
    return res.status(201).json(new ApiResponse("video details updated successfully",201,video))
})

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  //TODO: delete video
  const video = await Video.findByIdAndDelete(videoId)
    if(!video) throw new ApiError(404,"video not found")
    return res.status(201).json(new ApiResponse("video deleted",201,video))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  const video = await Video.findByIdAndUpdate(videoId,
    {
      $set: {isPublished: !video.isPublished}
    },
    {
      new: true
    })
    if(!video) throw new ApiError(501,"error while updating video publish status")
    return res.status(201).json(new ApiResponse("publish status toggled successfully",201,video))
})

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus
}