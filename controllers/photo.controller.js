const Photo = require('../models/photo.model');
const User = require('../models/user.model');
const upload = require('../middleware/multer');
const redis = require('redis');

const DEFAULT_EXPIRATION = 3600;

async function connectToRedis() {
    const client = redis.createClient();
    await client.connect(); 
    return client;

}

const createPhoto = async (req, res) => {
    try {
        
    //   console.log(req, "bodys")
        // Use upload middleware to handle image upload

        async function uploadImage(req, res) {
        return new Promise((resolve, reject) => {
            upload.single('image')(req, res, (err) => {
                if (err) {

                    return res.status(400).json({ error: err.message });

                }
                console.log("file uploaded");
                resolve(req);
            });
        });
}

uploadImage(req, res).then(async (req) => {
    const { userId, description, location } = req.body;
    const image = req.file.path; // Get the path of the uploaded image
    
    const photo = await Photo.create({
        userId,
        image,
        description,
        location: JSON.parse(location)
    });
    return res.status(201).json({ photo });
    });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
  

const getAllPhotos = async (req, res) => {
    try {
        const client = await connectToRedis();

        const { userId, location } = req.query;

        // Define cache keys based on query parameters
        const cacheKey = userId ? `photos:user:${userId}` : location ? `photos:location:${location}` : 'photos:all';

        // Check cache
        const cachedPhotos = await client.get(cacheKey);

        if (cachedPhotos) {
            console.log(`Cache hit for key: ${cacheKey}`);
            return res.status(200).json({ photos: JSON.parse(cachedPhotos) });
        }

        console.log(`Cache miss for key: ${cacheKey}`);
        
        // Fetch photos from database
        let photos;
        if (userId) {
            photos = await Photo.find({ userId });
        } else if (location) {
            const newlocation = location.split(',').map(parseFloat);
            photos = await Photo.find({
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
        } else {
            photos = await Photo.find();
        }

        if (photos.length === 0) {
            return res.status(404).json({ message: 'No photos found' });
        }

        await client.set(cacheKey, JSON.stringify(photos), { EX: 3600 }); 

        return res.status(200).json({ photos });

    } catch (error) {
        return res.status(500).json({ error: error.message });

    }
}

const getPhoto = async (req, res) => {
    try {
        const client = await connectToRedis();

        const { id } = req.params;

        const cashedPhoto = await client.get(id);

        if(cashedPhoto){
            return res.status(200).json({ photo: JSON.parse(cashedPhoto) });
        }else{
            const photo = await Photo.findById(id);

            if (photo) {
                await client.set(id, JSON.stringify(photo), {
                    EX: DEFAULT_EXPIRATION,
                    NX: true
                });

                return res.status(200).json({ photo });
            }
            return res.status(404).send("Photo with the specified ID does not exists");
        }
        
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

const updatePhoto = async (req, res) => {
    try {
        const client = await connectToRedis();
        const { id } = req.params;
        const cachedPhoto = await client.get(id);
        const updated = await Photo.findByIdAndUpdate(id, req.body)
        if (updated) {
            const photo = await Photo.findById(id);

            if(cachedPhoto){
                await client.del(id);
                await client.set(id, JSON.stringify(photo), {
                    EX: DEFAULT_EXPIRATION,
                    NX: true
                });
            }
            
            return res.status(200).json({ photo });
        }
        throw new Error("Photo not found");
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

const deletePhoto = async (req, res) => {
    try {
        const client = await connectToRedis();
        const { id } = req.params;
        const cachedPhoto = await client.get(id);
        const deleted = await Photo.findByIdAndDelete(id);

        if (deleted) {
            if (cachedPhoto){
                await client.del(id);
            }
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

