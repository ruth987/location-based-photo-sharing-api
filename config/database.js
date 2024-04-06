const mongoose = require('mongoose');
const { MONGO_URI } = process.env;

exports.connect = () => {
    // console.log('MONGO_URI:', MONGO_URI);
    mongoose.connect(MONGO_URI)
            .then(() => console.log('MongoDB connected successfully'))
            .catch(err => console.error('Error connecting to MongoDB:', err));
}
