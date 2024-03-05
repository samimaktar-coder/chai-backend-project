import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteFromCloudinary, deleteVideoFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    // TODO: get video, upload to cloudinary, create video
    if (!title || !description) {
        throw new ApiError(400, 'Please give a title and a description.');
    }

    let videoPath = req.files?.videoFile[0]?.path;
    let thumbnailPath = req.files?.thumbnail[0]?.path;

    if (!videoPath || !thumbnailPath) {
        throw new ApiError(400, 'Please give a video and a thumbnail.');
    }

    const videoFile = await uploadOnCloudinary(videoPath);
    const thumbnail = await uploadOnCloudinary(thumbnailPath);

    const video = await Video.create({
        videoFile: videoFile?.url,
        thumbnail: thumbnail?.url,
        title,
        description,
        duration: videoFile?.duration,
        views: 0,
        isPublished: true,
        owner: req.user._id
    });

    return res.status(200).json(new ApiResponse(200, video, 'Video uploaded successfully.'));

});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: get video by id
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(400, 'This video does not exists.');
    }

    return res.status(200).json(new ApiResponse(200, video, 'Video fetched successfully.'));
});

const updateVideo = asyncHandler(async (req, res) => {
    //TODO: update video details like title, description, thumbnail
    const { videoId } = req.params;
    const { title, description } = req.body;

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(400, 'This video does not exists.');
    }

    let thumbnailPath = req.file?.path;
    let thumbnail;
    if (thumbnailPath) {
        thumbnail = await uploadOnCloudinary(thumbnailPath);
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title: title || video.title,
                description: description || video.description,
                thumbnail: thumbnail?.url || video.thumbnail
            }
        },
        { new: true }
    );

    if (!updateVideo) {
        throw new ApiError(400, 'Video updation failed.');
    }

    await deleteFromCloudinary(video.thumbnail);

    return res.status(200).json(new ApiResponse(200, updatedVideo, 'Video updated successfully.'));
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: delete video
    const video = await Video.findByIdAndDelete(videoId);

    if (!video) {
        throw new ApiError(400, 'This video does not exists.');
    }

    await deleteVideoFromCloudinary(video.videoFile);
    await deleteFromCloudinary(video.thumbnail);


    return res.status(200).json(new ApiResponse(200, {}, 'Video deleted successfully.'));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);

    video.isPublished = !video.isPublished;

    const updatedVideo = await video.save();

    if (!video) {
        throw new ApiError(400, 'This user does not exists.');
    }

    return res.status(200).json(new ApiResponse(200, updatedVideo, 'Video updated successfully.'));
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
};
