import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const allVideoComments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        }
    ]);


    Comment.aggregatePaginate(allVideoComments, { page, limit })
        .then((result) => {
            return res.status(201).json(
                new ApiResponse(200, result, "VideoComments fetched  successfully!!"));
        })
        .catch((error) => {
            throw new ApiError(500, "something went wrong while fetching video Comments", error);
        });

});

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params;
    const { comment } = req.body;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "This video id is not valid");
    }

    if (!comment || comment.trim() === "") {
        throw new ApiError(400, 'Please give a comment.');
    }


    const commentData = await Comment.create({
        video: videoId,
        content: comment,
        owner: req.user._id
    });

    if (!commentData) {
        throw new ApiError(400, 'Something went wrong while uploading comment');
    }

    return res.status(200).json(new ApiResponse(200, commentData, 'Comment uploaded successfully.'));
});

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params;
    const { comment } = req.body;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "This video id is not valid");
    }

    const findComment = await Comment.findById(commentId);

    if (!findComment) {
        throw new ApiError(404, "comment not found!");
    }

    if (findComment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You don't have permission to update this comment!");
    }


    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content: comment
            }
        },
        { new: true }
    );

    if (!updatedComment) {
        throw new ApiError(400, 'comment does not exists.');
    }

    return res.status(200).json(new ApiResponse(200, updatedComment, 'Comment updated successfully.'));
});

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "This video id is not valid");
    }

    const findComment = await Comment.findById(commentId);

    if (!findComment) {
        throw new ApiError(404, "comment not found!");
    }

    if (findComment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You don't have permission to update this comment!");
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if (!deletedComment) {
        throw new ApiError(400, 'comment does not exists.');
    }

    return res.status(200).json(new ApiResponse(200, {}, 'Comment deleted successfully.'));
});

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
};
