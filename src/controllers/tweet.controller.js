import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { tweet } = req.body;

    if (!tweet) {
        throw new ApiError(400, 'There is no content.');
    }

    const userTweet = await Tweet.create({
        owner: req.user._id,
        content: tweet
    });

    return res.status(200).json(new ApiResponse(200, userTweet, 'Tweeted successfully'));
});

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params;

    const allTweets = await Tweet.find({ owner: userId });

    if (!allTweets.length) throw new ApiError(400, 'There is no tweet.');

    return res.status(200).json(new ApiResponse(200, allTweets, 'All tweets fetched successfully.'));
});

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params;
    const { tweet: tweetContent } = req.body;

    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content: tweetContent
            }
        },
        { new: true }
    );

    if (!tweet) throw new ApiError(200, "This tweet doesn't exists.");

    return res.status(200).json(new ApiResponse(200, tweet, 'Tweet updated successfully'));
});

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params;

    const tweet = await Tweet.findByIdAndDelete(tweetId);

    if (!tweet) throw new ApiError(200, "This tweet does not exists.");

    return res.status(200).json(new ApiResponse(200, {}, 'Tweet deleted successfully'));
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
};
