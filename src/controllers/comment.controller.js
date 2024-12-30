import mongoose from "mongoose"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    const options = {
        page : parseInt(page,10),
        limit : parseInt(limit,10)
    }
    const comments = await Comment.find({video: videoId})
    .skip((options.page-1)*options.limit)
    .limit(options.limit)

    if(!comments){
        throw new ApiError(502,"something wrong while fetching comments")
    }
    return res.status(201).json({
        data: new ApiResponse("comments fetched",201,comments),
        page: options.page,
        limit: options.limit,
    })
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {content} = req.body;
    const {videoId} = req.params
    const user = req.user
    if(!content){
        throw new ApiError(401,"either comment is empty or there is something wrong with comment")
    }
    
    const comment = await Comment.create(
        {
        content,
        video: videoId,
        owner : user
        }
    )
    if(!comment){
        throw new ApiError(501,"something wrong while saving comment in db")
    }
    return res.status(201).json(new ApiResponse("comment added successfully",201,comment))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const {content} = req.body
    if(!content) throw new ApiError(401,"something wrong with comment in updation");
    const comment = await Comment.findByIdAndUpdate(commentId,
        {
            $set: {
                content
            }
        },
        {
            new: true
        }
    )
    if(!comment) throw new ApiError(501,"somthing wrong while updating comment in db");
    return res.status(201).json( new ApiResponse("comment updated successfully",201))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params
    const comment = await Comment.findByIdAndDelete(commentId)
    if(!comment) throw new ApiError(501,"something wrong happened while deleting comment");
    res.status(201).json(new ApiResponse("comment deleted successfully",201))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }