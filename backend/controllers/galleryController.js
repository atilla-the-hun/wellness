import Gallery from '../models/galleryModel.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

// Get all gallery images
export const getAllGalleryImages = async (req, res) => {
    try {
        console.log('Fetching gallery images...');
        const images = await Gallery.find().sort('order');
        console.log('Found images:', images);
        res.status(200).json({ success: true, images });
    } catch (error) {
        console.error('Error in getAllGalleryImages:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add new gallery image
export const addGalleryImage = async (req, res) => {
    try {
        console.log('Adding new gallery image...');
        console.log('Request body:', req.body);
        console.log('Request file:', req.file);
        console.log('Request headers:', req.headers);

        const { title, altText } = req.body;
        const file = req.file;

        if (!file) {
            console.error('No file provided');
            return res.status(400).json({ success: false, message: 'Please upload an image' });
        }

        if (!title || !altText) {
            console.error('Missing required fields:', { title, altText });
            return res.status(400).json({ success: false, message: 'Title and alt text are required' });
        }

        // Upload image to cloudinary
        console.log('Uploading image to Cloudinary...');
        console.log('File details:', {
            mimetype: file.mimetype,
            size: file.size,
            buffer: file.buffer ? 'Buffer present' : 'No buffer',
            originalname: file.originalname
        });

        const result = await uploadToCloudinary(file.buffer, file.mimetype, 'gallery');
        console.log('Cloudinary upload result:', result);

        // Get the highest order number
        const highestOrder = await Gallery.findOne().sort('-order');
        const newOrder = highestOrder ? highestOrder.order + 1 : 0;

        // Create new gallery image
        const newImage = await Gallery.create({
            title,
            imageUrl: result.secure_url,
            altText,
            order: newOrder
        });

        console.log('New gallery image created:', newImage);
        res.status(201).json({ success: true, image: newImage });
    } catch (error) {
        console.error('Error in addGalleryImage:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ 
            success: false, 
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Update gallery image
export const updateGalleryImage = async (req, res) => {
    try {
        console.log('Updating gallery image...');
        console.log('Request body:', req.body);
        console.log('Request file:', req.file);
        console.log('Request headers:', req.headers);
        
        const { id } = req.params;
        const { title, altText } = req.body;
        const file = req.file;

        const image = await Gallery.findById(id);
        if (!image) {
            return res.status(404).json({ success: false, message: 'Image not found' });
        }

        let imageUrl = image.imageUrl;
        if (file) {
            console.log('Uploading new image to Cloudinary...');
            const result = await uploadToCloudinary(file.buffer, file.mimetype, 'gallery');
            imageUrl = result.secure_url;

            // Delete old image from cloudinary
            if (image.imageUrl) {
                const publicId = `gallery/${image.imageUrl.split('/').pop().split('.')[0]}`;
                console.log('Deleting old image from Cloudinary:', publicId);
                await deleteFromCloudinary(publicId);
            }
        }

        const updatedImage = await Gallery.findByIdAndUpdate(
            id,
            { title, altText, imageUrl },
            { new: true }
        );

        console.log('Gallery image updated:', updatedImage);
        res.status(200).json({ success: true, image: updatedImage });
    } catch (error) {
        console.error('Error in updateGalleryImage:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete gallery image
export const deleteGalleryImage = async (req, res) => {
    try {
        console.log('Deleting gallery image...');
        const { id } = req.params;

        const image = await Gallery.findById(id);
        if (!image) {
            return res.status(404).json({ success: false, message: 'Image not found' });
        }

        // Delete image from cloudinary
        if (image.imageUrl) {
            const publicId = `gallery/${image.imageUrl.split('/').pop().split('.')[0]}`;
            console.log('Deleting image from Cloudinary:', publicId);
            await deleteFromCloudinary(publicId);
        }

        // Delete image from database
        await Gallery.findByIdAndDelete(id);

        // Reorder remaining images
        const remainingImages = await Gallery.find().sort('order');
        for (let i = 0; i < remainingImages.length; i++) {
            await Gallery.findByIdAndUpdate(remainingImages[i]._id, { order: i });
        }

        console.log('Gallery image deleted successfully');
        res.status(200).json({ success: true, message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Error in deleteGalleryImage:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Reorder gallery images
export const reorderGalleryImages = async (req, res) => {
    try {
        console.log('Reordering gallery images...');
        console.log('Request body:', req.body);
        
        const { imageIds } = req.body;
        if (!imageIds || !Array.isArray(imageIds)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Image IDs array is required' 
            });
        }

        // Update order for each image
        for (let i = 0; i < imageIds.length; i++) {
            await Gallery.findByIdAndUpdate(imageIds[i], { order: i });
        }

        const updatedImages = await Gallery.find().sort('order');
        console.log('Gallery images reordered successfully');
        res.status(200).json({ success: true, images: updatedImages });
    } catch (error) {
        console.error('Error in reorderGalleryImages:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
