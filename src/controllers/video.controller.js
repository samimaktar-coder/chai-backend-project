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

    Video.aggregatePaginate(
        Video.aggregate([
            {
                $match: {
                    owner: new mongoose.Types.ObjectId(userId)
                }
            }
        ]),
        { page, limit })
        .then((result) => {
            return res.status(200).json(
                new ApiResponse(200, result, "All videos fetched  successfully!!"));
        })
        .catch((error) => {
            throw new ApiError(500, "something went wrong while fetching video Comments", error);
        });

});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    // TODO: get video, upload to cloudinary, create video
    if (!title || title.trim() === "" || !description || description.trim() === "") {
        throw new ApiError(400, 'Please give a title and a description.');
    }

    let videoPath = req.files?.videoFile[0]?.path;
    let thumbnailPath = req.files?.thumbnail[0]?.path;

    if (!videoPath || !thumbnailPath) {
        throw new ApiError(400, 'Please give a video and a thumbnail.');
    }

    const videoFile = await uploadOnCloudinary(videoPath);
    const thumbnail = await uploadOnCloudinary(thumbnailPath);

    if (!videoFile?.url || !thumbnail?.url) {
        throw new ApiError(500, "Something went wrong while uplaoding the video and thumbnail");
    }

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

    if (!video) {
        throw new ApiError(400, 'Video is not published.');
    }

    return res.status(200).json(new ApiResponse(200, video, 'Video uploaded successfully.'));

});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: get video by id
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(400, 'This video does not exists.');
    }

    if (!video.isPublished && !(video.owner.toString() === req.user?._id.toString())) {
        throw new ApiError(400, 'You are not allowed to access this video.');
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

    if (!(video.owner.toString() === req.user?._id.toString())) {
        throw new ApiError(400, 'You are not allowed to access this video.');
    }


    let thumbnailPath = req.file?.path;
    let thumbnail;
    if (thumbnailPath) {
        thumbnail = await uploadOnCloudinary(thumbnailPath);
    }

    if (!thumbnail?.url && !title && title.trim() === "" && !description && description.trim() === "") {
        throw new ApiError(400, 'Please give any data to update.');
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

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, 'This is not a valid video id.');
    }

    const findVideo = await Video.findById(videoId);

    if (!findVideo) {
        throw new ApiError(400, 'This video does not exists.');
    }

    if (!(findVideo.owner.toString() === req.user?._id.toString())) {
        throw new ApiError(400, 'You are not allowed to access this video.');
    }

    const video = await Video.findByIdAndDelete(videoId);

    await deleteVideoFromCloudinary(video.videoFile);
    await deleteFromCloudinary(video.thumbnail);


    return res.status(200).json(new ApiResponse(200, {}, 'Video deleted successfully.'));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(400, 'This user does not exists.');
    }

    if (!(video.owner.toString() === req.user?._id.toString())) {
        throw new ApiError(400, 'You are not allowed to access this video.');
    }

    video.isPublished = !video.isPublished;

    const updatedVideo = await video.save({ validateBeforeSave: false });


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
