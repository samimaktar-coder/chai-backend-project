import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: toggle like on video
    const removeLike = await Like.findOneAndDelete({ likedBy: req.user._id, video: videoId });

    if (removeLike) {
        return res.status(200).json(new ApiResponse(200, {}, 'Like removed successfully.'));
    }

    let like = await Like.create({
        likedBy: req.user._id,
        video: videoId
    });

    if (!like) {
        throw new ApiError(400, 'Something went wrong while liking.');
    }

    return res.status(200).json(new ApiResponse(200, like, 'Liked successfully.'));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    //TODO: toggle like on comment
    const removeLike = await Like.findOneAndDelete({ likedBy: req.user._id, comment: commentId });

    if (removeLike) {
        return res.status(200).json(new ApiResponse(200, {}, 'Like removed successfully.'));
    }

    let like = await Like.create({
        likedBy: req.user._id,
        comment: commentId
    });

    if (!like) {
        throw new ApiError(400, 'Something went wrong while liking.');
    }

    return res.status(200).json(new ApiResponse(200, like, 'Liked successfully.'));

});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    //TODO: toggle like on tweet
    const removeLike = await Like.findOneAndDelete({ likedBy: req.user._id, tweet: tweetId });

    if (removeLike) {
        return res.status(200).json(new ApiResponse(200, {}, 'Like removed successfully.'));
    }

    let like = await Like.create({
        likedBy: req.user._id,
        tweet: tweetId
    });

    if (!like) {
        throw new ApiError(400, 'Something went wrong while liking.');
    }

    return res.status(200).json(new ApiResponse(200, like, 'Liked successfully.'));
}
);

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const allVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $group: {
                _id: 'likedBy',
                videos: { $push: "$video" }
            }
        },
        {
            $project: {
                _id: 0,
                videos: 1
            }
        }
    ]);

    if (!allVideos.length) {
        throw new ApiError(400, 'There is no videos');
    }

    if (allVideos.length === 0) {
        return res.status(200).json(new ApiResponse(200, allVideos[0], 'There is no videos you liked'));
    }
    return res.status(200).json(new ApiResponse(200, allVideos[0], 'All liked videos fetched.'));


});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
};