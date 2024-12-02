import { v2 as cloudinary } from 'cloudinary';

const connectCloudinary = () => {
    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_SECRET_KEY
        });
        console.log('Cloudinary connected successfully');
    } catch (error) {
        console.error('Cloudinary connection error:', error);
        throw error;
    }
};

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = async (fileBuffer, mimetype, folder = 'gallery') => {
    try {
        // Convert buffer to base64
        const base64String = `data:${mimetype};base64,${fileBuffer.toString('base64')}`;
        
        const result = await cloudinary.uploader.upload(base64String, {
            folder: folder,
            resource_type: 'auto'
        });

        return result;
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    }
};

// Helper function to delete file from Cloudinary
const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        throw error;
    }
};

export { connectCloudinary as default, cloudinary, uploadToCloudinary, deleteFromCloudinary };
