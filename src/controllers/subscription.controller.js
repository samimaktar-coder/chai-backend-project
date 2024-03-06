import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    // TODO: toggle subscription
    const userId = req.user._id;

    const channel = await User.findById(channelId);

    if (!isValidObjectId(channelId) || !channel) {
        throw new ApiError(400, 'This channel does not exist.');
    }

    const alreadySubscribed = await Subscription.findOneAndDelete(
        {
            subscriber: userId,
            channel: channelId
        }
    );

    if (alreadySubscribed) {
        return res.status(200).json(new ApiResponse(200, alreadySubscribed, 'Unsubscribed successfully.'));
    }

    const subscription = await Subscription.create(
        {
            subscriber: userId,
            channel: channelId
        }
    );

    if (!subscription) throw new ApiError(400, 'Something went wrong while subscription.');

    return res.status(200).json(new ApiResponse(200, subscription, 'Subscribed successfully.'));

});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;
    console.log(subscriberId);

    const allSubscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber"
            }
        },
        {
            $unwind: "$subscriber" // Unwind the subscribers array
        },
        {
            $project: {
                _id: "$subscriber._id",
                username: "$subscriber.username",
                fullName: "$subscriber.fullName",
                avatar: "$subscriber.avatar"
            }
        },
        {
            $group: {
                _id: null,
                subscribers: { $push: "$$ROOT" }
            }
        },
        {
            $project: {
                _id: 0,
                subscribers: 1
            }
        }
    ]);

    console.log(allSubscribers[0].subscribers);

    if (!allSubscribers[0].subscribers.length) {
        throw new ApiError(400, 'Channel does not exists');
    }

    if (allSubscribers[0].subscribers.length === 0) {
        return res.status(200).json(new ApiResponse(200, allSubscribers[0], 'This channel does not have subscribr yet.'));
    }

    return res.status(200).json(new ApiResponse(200, allSubscribers[0], 'All Subscribers fetched succesffully.'));

});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    console.log(channelId);

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channel"
            }
        },
        {
            $unwind: "$channel" // Unwind the channels array
        },
        {
            $project: {
                _id: "$channel._id",
                username: "$channel.username",
                fullName: "$channel.fullName",
                avatar: "$channel.avatar"
            }
        },
        {
            $group: {
                _id: null,
                channels: { $push: "$$ROOT" }
            }
        },
        {
            $project: {
                _id: 0,
                channels: 1
            }
        }
    ]);


    if (!subscribedChannels[0].channels.length) {
        throw new ApiError(400, 'This user does not exists');
    }

    if (subscribedChannels[0].channels.length === 0) {
        return res.status(200).json(new ApiResponse(200, subscribedChannels[0], 'This user does not subscribed any channle yet.'));
    }

    return res.status(200).json(new ApiResponse(200, subscribedChannels[0], 'All subscribed channels fetched successfully.'));
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
};