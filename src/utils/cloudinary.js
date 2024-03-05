import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        });
        //file has been uploaded successfully
        // console.log('FILE IS UPLOADED ON CLOUDINARY SUCCESSFULLY: ', response.url, response);
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
};

// BY_ME: This function is written by me.
const deleteFromCloudinary = async (url) => {
    try {
        const parts = url.split('/');
        // Find the part containing the public_id
        let publicId = parts[parts.length - 1].split('.')[0];
        if (!publicId) return null;
        const response = await cloudinary.uploader.destroy(publicId);
        return response;
    } catch (error) {
        return error;
    }
};
const deleteVideoFromCloudinary = async (url) => {
    try {
        const parts = url.split('/');
        // Find the part containing the public_id
        let publicId = parts[parts.length - 1].split('.')[0];
        if (!publicId) return null;
        const response = await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
        return response;
    } catch (error) {
        return error;
    }
};

export { uploadOnCloudinary, deleteFromCloudinary, deleteVideoFromCloudinary };