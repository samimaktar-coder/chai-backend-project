import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const toggleSubscription = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;
    // TODO: toggle subscription
    const userId = req.user._id;

    const alreadySubscribed = await Subscription.findOneAndDelete(
        {
            subscriber: userId,
            channel: subscriberId
        }
    );

    if (alreadySubscribed) {
        return res.status(200).json(new ApiResponse(200, alreadySubscribed, 'Unsubscribed successfully.'));
    }

    const subscription = await Subscription.create(
        {
            subscriber: userId,
            channel: subscriberId
        }
    );

    if (!subscription) throw new ApiError(400, 'There is something wrong in subscription.');

    return res.status(200).json(new ApiResponse(200, subscription, 'Subscribed successfully.'));

});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;
    console.log(subscriberId);

    // const allSubscribers = await User.aggregate([
    //     {
    //         $match: {
    //             _id: new mongoose.Types.ObjectId(subscriberId)
    //         }
    //     },
    //     {
    //         $lookup: {
    //             from: "subscriptions",
    //             localField: "_id",
    //             foreignField: "channel",
    //             as: "subscribers"
    //         }
    //     },
    //     {
    //         $group: {
    //             _id: "_id",
    //             subscribers: { $push: "$subscribers" },
    //         }
    //     }
    //     , {
    //         $project: {
    //             _id: 0,
    //             subscribers: 1
    //         }
    //     }
    // ]);


    const allSubscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $group: {
                _id: "channel",
                subscribers: { $push: "$subscriber" },
            }
        }
        , {
            $project: {
                _id: 0,
                subscribers: 1
            }
        }
    ]);

    // console.log(allSubscribers[0]);

    if (!allSubscribers.length) {
        throw new ApiError(400, 'Channel does not exists');
    }

    if (allSubscribers[0].length === 0) {
        return res.status(200).json(new ApiResponse(200, allSubscribers[0], 'This channel does not have subscribr yet.'));
    }

    return res.status(200).json(new ApiResponse(200, allSubscribers[0], 'All Subscribers fetched succesffully.'));

});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    console.log(channelId);

    // const subscribedChannels = await User.aggregate([
    //     {
    //         $match: {
    //             _id: new mongoose.Types.ObjectId(channelId)
    //         }
    //     },
    //     {
    //         $lookup: {
    //             from: 'subscriptions',
    //             localField: '_id',
    //             foreignField: 'subscriber',
    //             as: 'channels'
    //         }
    //     },
    //     {
    //         $group: {
    //             _id: '_id',
    //             channels: { $push: "$channels" }
    //         }
    //     },
    //     {
    //         $project: {
    //             _id: 0,
    //             channels: 1
    //         }
    //     }
    // ]);

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $group: {
                _id: 'subscriber',
                channels: { $push: "$channel" }
            }
        },
        {
            $project: {
                _id: 0,
                channels: 1
            }
        }
    ]);

    // console.log(subscribedChannels[0]);

    if (!subscribedChannels.length) {
        throw new ApiError(400, 'This user does not exists');
    }

    if (subscribedChannels[0].length === 0) {
        return res.status(200).json(new ApiResponse(200, subscribedChannels[0], 'This user does not subscribed any channle yet.'));
    }

    return res.status(200).json(new ApiResponse(200, subscribedChannels[0], 'All subscribed channels fetched successfully.'));
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
};