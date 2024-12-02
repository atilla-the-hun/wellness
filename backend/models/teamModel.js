import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
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
teamSchema.pre('save', function(next) {
    console.log('Saving team member:', this);
    next();
});

// Add a post-save hook to log when a document has been saved
teamSchema.post('save', function(doc) {
    console.log('Team member saved:', doc);
});

const Team = mongoose.model('Team', teamSchema);

export default Team;
