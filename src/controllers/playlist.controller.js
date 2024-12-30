import { ApiError } from "../utils/ApiError.js"
import { Playlist } from "../models/playlist.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const {name, description} = req.body
  //TODO: create playlist
  if(!name){
    throw new ApiError(401,"name is required")
  }
  const playlist = await Playlist.create(
    {
      name,
      description,
      owner: res.user._id
    }
  )
  if(!playlist){
    throw new ApiError(500,"something went wrong while creating playlist")
  }
  return res.status(201).json(new ApiResponse("playlist is created",201,playlist))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
  const {userId} = req.params
  //TODO: get user playlists
  const playlist = await Playlist.find({owner: userId})
  if(!playlist){
    throw new ApiError(401,"something wrong while fetching playlist or no playlist found")
  }
  return res.status(201).json(new ApiResponse("User's playlists fetched successfully",201,playlist))
})

const getPlaylistById = asyncHandler(async (req, res) => {
  const {playlistId} = req.params
  //TODO: get playlist by id
  const playlist = await Playlist.findById(playlistId)
  if(!playlist){
    throw new ApiError(405,"something wrong while fetching playlist")
  }
  return res.status(201).json(new ApiResponse("playlist fetched successfully",201,playlist))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const {playlistId, videoId} = req.params
  try {
    const playlist = await Playlist.findByIdAndUpdate(playlistId,
      {
        $addToSet: {
          videos : videoId
        }
      },
      {
        new : true
      }
    ).select("-description -videos -owner")
    
    if(!playlist){
      throw new ApiError(502,"something wrong while adding video to playlist")
    }
    return res.status(201).json(new ApiResponse("video added successfully",201,playlist))
  } catch (error) {
    throw new ApiError(500,"somenthing wrong while adding videos to playlist")
  }
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const {playlistId, videoId} = req.params
  // TODO: remove video from playlist
  const playlist = await Playlist.findByIdAndUpdate(playlistId,
    {
      $pull : {
        videos: videoId
      }
    },{
      new : true
    }
  ).select("-description -owner")

  if(!playlist){
    throw new ApiError(402,"playlist not found or something wrong while removing video")
  }
  return res.status(201).json(new ApiResponse("video removed successfully",201,playlist))
})

const deletePlaylist = asyncHandler(async (req, res) => {
  const {playlistId} = req.params
  // TODO: delete playlist
  const playlist = await Playlist.findByIdAndDelete(playlistId)
  if(!playlist){
    throw new ApiError(502,"something wrong while deleting playlist")
  }
  return res.status(201).json(new ApiResponse("playlist deleted successfully",201,playlist))
})

const updatePlaylist = asyncHandler(async (req, res) => {
  const {playlistId} = req.params
  const {name, description} = req.body
  //TODO: update playlist
  if(!name && !description){
    throw new ApiError(401,"atleat one of the name and the description must be provided")
  }
  const updateFields = {}
  if(name) updateFields.name = name
  if(name) updateFields.description = description
  const playlist = await Playlist.findByIdAndUpdate(playlistId,updateFields)
  if(!playlist){
    throw new ApiError(502,"something wrong while updating playlist details")
  }
  return res.status(201).json(new ApiResponse("playlist details updated successfully",201,playlist))
})

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist
}