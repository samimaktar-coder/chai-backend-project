import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    //TODO: create playlist

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id,
        videos: []
    });

    if (!playlist) {
        throw new ApiError(400, "Something went while creating playlist");
    }

    return res.status(200).json(new ApiResponse(200, playlist, 'Playlist created successfully.'));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    //TODO: get user playlists


    const allPlaylist = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        }
    ]);

    // console.log(isValidObjectId(userId));

    if (!allPlaylist.length) {
        throw new ApiError(200, 'This user does not exists.');
    }

    if (allPlaylist.length === 0) {
        return res.status(200).json(new ApiResponse(200, [], 'This user does not have any playlist.'));
    }

    return res.status(200).json(new ApiResponse(200, allPlaylist, 'All playlist fetched successfully.'));

});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    //TODO: get playlist by id
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(400, "This playlist does not exists.");
    }

    return res.status(200).json(new ApiResponse(200, playlist, 'Playlist fetched successfully.'));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet: {
                videos: videoId
            }
        },
        { new: true }
    );

    if (!updatePlaylist) {
        throw new ApiError(400, 'This playlist does not exists.');
    }

    return res.status(200).json(new ApiResponse(200, updatedPlaylist, 'Playlist updated successfully.'));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    // TODO: remove video from playlist


    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {
                videos: videoId
            }
        },
        { new: true }
    );

    if (!updatePlaylist) {
        throw new ApiError(400, 'This playlist does not exists.');
    }

    return res.status(200).json(new ApiResponse(200, updatedPlaylist, 'Video removed from Playlist successfully.'));

});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    // TODO: delete playlist
    const playlist = await Playlist.findByIdAndDelete(playlistId);

    if (!playlist) {
        throw new ApiError(400, 'This playlist does not exists.');
    }

    return res.status(200).json(new ApiResponse(200, {}, 'Playlist deleted successfully.'));
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;
    //TODO: update playlist

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name: name,
                description: description
            }
        },
        { new: true }
    );

    if (!updatePlaylist) {
        throw new ApiError(400, 'This playlist does not exists.');
    }

    return res.status(200).json(new ApiResponse(200, updatedPlaylist, 'Playlist updated successfully.'));
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
};
