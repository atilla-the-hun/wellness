import Team from '../models/teamModel.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

// Get all team members
export const getAllTeamMembers = async (req, res) => {
    try {
        console.log('Fetching team members...');
        const members = await Team.find().sort('order');
        console.log('Found members:', members);
        res.status(200).json({ success: true, members });
    } catch (error) {
        console.error('Error in getAllTeamMembers:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add new team member
export const addTeamMember = async (req, res) => {
    try {
        console.log('Adding new team member...');
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

        const result = await uploadToCloudinary(file.buffer, file.mimetype, 'team');
        console.log('Cloudinary upload result:', result);

        // Get the highest order number
        const highestOrder = await Team.findOne().sort('-order');
        const newOrder = highestOrder ? highestOrder.order + 1 : 0;

        // Create new team member
        const newMember = await Team.create({
            title,
            imageUrl: result.secure_url,
            altText,
            order: newOrder
        });

        console.log('New team member created:', newMember);
        res.status(201).json({ success: true, member: newMember });
    } catch (error) {
        console.error('Error in addTeamMember:', error);
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

// Update team member
export const updateTeamMember = async (req, res) => {
    try {
        console.log('Updating team member...');
        console.log('Request body:', req.body);
        console.log('Request file:', req.file);
        console.log('Request headers:', req.headers);
        
        const { id } = req.params;
        const { title, altText } = req.body;
        const file = req.file;

        const member = await Team.findById(id);
        if (!member) {
            return res.status(404).json({ success: false, message: 'Team member not found' });
        }

        let imageUrl = member.imageUrl;
        if (file) {
            console.log('Uploading new image to Cloudinary...');
            const result = await uploadToCloudinary(file.buffer, file.mimetype, 'team');
            imageUrl = result.secure_url;

            // Delete old image from cloudinary
            if (member.imageUrl) {
                const publicId = `team/${member.imageUrl.split('/').pop().split('.')[0]}`;
                console.log('Deleting old image from Cloudinary:', publicId);
                await deleteFromCloudinary(publicId);
            }
        }

        const updatedMember = await Team.findByIdAndUpdate(
            id,
            { title, altText, imageUrl },
            { new: true }
        );

        console.log('Team member updated:', updatedMember);
        res.status(200).json({ success: true, member: updatedMember });
    } catch (error) {
        console.error('Error in updateTeamMember:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete team member
export const deleteTeamMember = async (req, res) => {
    try {
        console.log('Deleting team member...');
        const { id } = req.params;

        const member = await Team.findById(id);
        if (!member) {
            return res.status(404).json({ success: false, message: 'Team member not found' });
        }

        // Delete image from cloudinary
        if (member.imageUrl) {
            const publicId = `team/${member.imageUrl.split('/').pop().split('.')[0]}`;
            console.log('Deleting image from Cloudinary:', publicId);
            await deleteFromCloudinary(publicId);
        }

        // Delete member from database
        await Team.findByIdAndDelete(id);

        // Reorder remaining members
        const remainingMembers = await Team.find().sort('order');
        for (let i = 0; i < remainingMembers.length; i++) {
            await Team.findByIdAndUpdate(remainingMembers[i]._id, { order: i });
        }

        console.log('Team member deleted successfully');
        res.status(200).json({ success: true, message: 'Team member deleted successfully' });
    } catch (error) {
        console.error('Error in deleteTeamMember:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Reorder team members
export const reorderTeamMembers = async (req, res) => {
    try {
        console.log('Reordering team members...');
        console.log('Request body:', req.body);
        
        const { memberIds } = req.body;
        if (!memberIds || !Array.isArray(memberIds)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Member IDs array is required' 
            });
        }

        // Update order for each member
        for (let i = 0; i < memberIds.length; i++) {
            await Team.findByIdAndUpdate(memberIds[i], { order: i });
        }

        const updatedMembers = await Team.find().sort('order');
        console.log('Team members reordered successfully');
        res.status(200).json({ success: true, members: updatedMembers });
    } catch (error) {
        console.error('Error in reorderTeamMembers:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
