import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const userId = req.user?._id;


    const channelStat = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "Likes"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "owner",
                foreignField: "channel",
                as: "Subscribers"
            }
        },
        {
            $group: {
                _id: null,
                TotalVideos: { $sum: 1 },
                TotalViews: { $sum: "$views" },
                TotalSubscribers: { $first: { $size: "$Subscribers" } },
                TotalLikes: { $first: { $size: "$Likes" } }
            }
        },
        {
            $project: {
                _id: 0,
                TotalSubscribers: 1,
                TotalLikes: 1,
                TotalVideos: 1,
                TotalViews: 1
            }
        }

    ]);

    if (!channelStat) {
        throw new ApiError(500, "Unable to fetch the channel stat!");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, channelStat[0], "Channel Stat fetched Successfully"));
});


const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    const allVideos = await Video.find({ owner: req.user._id });

    if (!allVideos) {
        throw new ApiError(400, 'This channel has not posted any video yet.');
    }

    return res.status(200).json(new ApiResponse(200, allVideos, 'All videos fetched successfully.'));
});

export {
    getChannelStats,
    getChannelVideos
};