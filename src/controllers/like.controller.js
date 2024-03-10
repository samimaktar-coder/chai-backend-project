import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: toggle like on video
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "This video id is not valid");
    }

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
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "This comment id is not valid");
    }

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
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "This tweet id is not valid");
    }

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
            $lookup: {
                from: 'videos',
                localField: 'video',
                foreignField: '_id',
                as: 'likedVideos'
            }
        },
        {
            $unwind: "$likedVideos"
        },
        {
            $match: {
                "likedVideos.isPublished": true
            }
        },
        {
            $project: {
                _id: "$likedVideos._id",
                thumbnail: "$likedVideos.thumbnail",
                title: "$likedVideos.title",
                description: "$likedVideos.description",
                duration: "$likedVideos.duration",
                owner: "$likedVideos.owner",
                createdAt: "$likedVideos.createdAt",
            }
        },
        {
            $group: {
                _id: null,
                likedVideos: { $push: "$$ROOT" }
            }
        },
        {
            $project: {
                _id: 0,
                likedVideos: 1
            }
        }
    ]);


    if (!allVideos.length) {
        return res.status(200).json(new ApiResponse(200, allVideos, 'There is no videos you liked'));
    }

    return res.status(200).json(new ApiResponse(200, allVideos[0], 'All liked videos fetched.'));
});

const getLikedTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;


    if (!isValidObjectId(userId)) {
        throw new ApiError(400, 'This is not a valid user id.');
    }

    const likedTweets = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: 'tweets',
                localField: 'tweet',
                foreignField: '_id',
                as: 'likedTweets'
            }
        },
        {
            $unwind: "$likedTweets"
        },
        {
            $project: {
                _id: "$likedTweets._id",
                owner: "$likedTweets.owner",
                content: "$likedTweets.content",
                createdAt: "$likedTweets.createdAt",
                updatedAt: "$likedTweets.updatedAt"
            }
        },
        {
            $group: {
                _id: null,
                likedTweets: { $push: "$$ROOT" }
            }
        },
        {
            $project: {
                _id: 0,
                likedTweets: 1
            }
        }
    ]);


    if (!likedTweets.length) {
        return res.status(200).json(new ApiResponse(200, likedTweets, 'This user has not liked any tweet yet.'));
    }

    return res.status(200).json(new ApiResponse(200, likedTweets[0], 'All tweets fetched successfully.'));

});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,
    getLikedTweets
};