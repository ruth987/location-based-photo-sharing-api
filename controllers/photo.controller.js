const Photo = require('../models/photo.model');
const User = require('../models/user.model');

const createPhoto = async (req, res) => {
    const { userId, image, description, location } = req.body;
    try {
        const photo = await Photo.create({
            userId,
            image,
            description,
            location
        });
        return res.status(201).json({ photo });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const getAllPhotos = async (req, res) => {
    try {
        const { userId, location } = req.query;
        // console.log(location);
        if (userId) {
            const photos = await Photo.find({ userId });

            if (photos.length === 0) {
                return res.status(404).json({ message: 'No photos found for this user' });
            }

            return res.status(200).json({ photos });
        }
        if (location) {
            const newlocation = location.split(',').map(parseFloat);

            const photos = await Photo.find({
                location: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: newlocation
                        },
                        $maxDistance: 10000
                    }
                }
            });

            if (photos.length === 0) {
                return res.status(404).json({ message: 'No photos found for this location' });
            }

            return res.status(200).json({ photos });
        }
        const photos = await Photo.find();

        if (photos.length === 0) {
            return res.status(404).json({ message: 'No photos found' });
        }

        return res.status(200).json({ photos });

    } catch (error) {
        return res.status(500).json({ error: error.message });

    }
}


const getPhoto = async (req, res) => {
    try {
        const { id } = req.params;
        const photo = await Photo.findById(id);
        if (photo) {
            return res.status(200).json({ photo });
        }
        return res.status(404).send("Photo with the specified ID does not exists");
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

const updatePhoto = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Photo.findByIdAndUpdate(id, req.body)
        if (updated) {
            const photo = await Photo.findById(id);
            return res.status(200).json({ photo });
        }
        throw new Error("Photo not found");
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

const deletePhoto = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Photo.findByIdAndDelete(id);
        if (deleted) {
            return res.status(204).send("Photo deleted");
        }
        throw new Error("Photo not found");
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

module.exports = {
    createPhoto,
    getAllPhotos,
    getPhoto,
    updatePhoto,
    deletePhoto
}

