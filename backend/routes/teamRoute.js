import express from 'express';
import upload from '../middleware/multer.js';
import authAdmin from '../middleware/authAdmin.js';
import {
    getAllTeamMembers,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    reorderTeamMembers
} from '../controllers/teamController.js';

const router = express.Router();

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
    if (err) {
        console.error('Multer error:', err);
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size cannot exceed 5MB'
            });
        }
        if (req.fileValidationError) {
            return res.status(400).json({
                success: false,
                message: req.fileValidationError
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message || 'Error uploading file'
        });
    }
    next();
};

// Middleware to validate request body
const validateTeamInput = (req, res, next) => {
    console.log('Validating team input:', {
        body: req.body,
        file: req.file,
        headers: req.headers
    });

    // For multipart form data, the fields will be in req.body after multer processes the request
    const title = req.body?.title;
    const altText = req.body?.altText;

    if (!title || !altText) {
        console.error('Missing required fields:', { title, altText });
        return res.status(400).json({
            success: false,
            message: 'Title and alt text are required'
        });
    }

    next();
};

// Public routes
router.get('/members', getAllTeamMembers);

// Admin routes - Note the order of middleware: auth -> file upload -> validation
router.post('/admin/add', 
    authAdmin,
    upload.single('image'), // Process file upload first
    handleMulterError,
    validateTeamInput, // Then validate form fields
    addTeamMember
);

router.put('/admin/update/:id',
    authAdmin,
    upload.single('image'),
    handleMulterError,
    validateTeamInput,
    updateTeamMember
);

router.delete('/admin/delete/:id',
    authAdmin,
    deleteTeamMember
);

router.put('/admin/reorder',
    authAdmin,
    (req, res, next) => {
        if (!req.body.memberIds || !Array.isArray(req.body.memberIds)) {
            return res.status(400).json({
                success: false,
                message: 'Member IDs array is required'
            });
        }
        next();
    },
    reorderTeamMembers
);

export default router;
