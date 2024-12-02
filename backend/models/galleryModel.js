import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required']
    },
    imageUrl: {
        type: String,
        required: [true, 'Image URL is required']
    },
    altText: {
        type: String,
        required: [true, 'Alt text is required']
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Add a pre-save hook to log when a document is being saved
gallerySchema.pre('save', function(next) {
    console.log('Saving gallery image:', this);
    next();
});

// Add a post-save hook to log when a document has been saved
gallerySchema.post('save', function(doc) {
    console.log('Gallery image saved:', doc);
});

const Gallery = mongoose.model('Gallery', gallerySchema);

export default Gallery;
