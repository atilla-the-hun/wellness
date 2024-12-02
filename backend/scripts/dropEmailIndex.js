import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const dropEmailIndex = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('Connected to MongoDB');

        const collections = await mongoose.connection.db.collections();
        const usersCollection = collections.find(collection => collection.collectionName === 'users');
        
        if (usersCollection) {
            await usersCollection.dropIndex('email_1');
            console.log('Successfully dropped email index');
        } else {
            console.log('Users collection not found');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

dropEmailIndex();
