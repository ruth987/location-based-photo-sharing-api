const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    image: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],  // Fixed value
            required: true
        },
        coordinates: {
            type: [Number],  // Array of [longitude, latitude]
            required: true
        }
    }
},
{
    timestamps: true
}
);

// to make seaching faster

photoSchema.index({ location: '2dsphere' });

photoSchema.index({description: 'text'});

const Photo = mongoose.model('Photo', photoSchema);

module.exports = Photo;

