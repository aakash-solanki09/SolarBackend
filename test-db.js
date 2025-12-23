const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        // Mask password in logs
        const uri = process.env.MONGO_URI;
        const maskedUri = uri.replace(/:([^:@]+)@/, ':****@');
        console.log(`URI: ${maskedUri}`);

        await mongoose.connect(uri);
        console.log('MongoDB Connected Successfully!');
        process.exit(0);
    } catch (error) {
        console.error('MongoDB Connection Error:');
        console.error(`Message: ${error.message}`);
        console.error(`CodeName: ${error.codeName}`);
        console.error(`Code: ${error.code}`);
        process.exit(1);
    }
};

connectDB();
