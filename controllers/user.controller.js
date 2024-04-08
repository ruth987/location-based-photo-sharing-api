const User = require('../models/user.model');
const upload = require('../middleware/multer');
const redis = require('redis');
// const client = redis.createClient();

const DEFAULT_EXPIRATION = 3600;

async function connectToRedis() {
    const client = redis.createClient();
    await client.connect(); 
    return client;

}

const getUsers = async (req, res) => {   
    try {
        const client = await connectToRedis();
        // Check if the data is already in the cache
        const cachedUsers = await client.get('users');

        if (cachedUsers) {
            console.log("getting data from cache");
            return res.status(200).json({ users: JSON.parse(cachedUsers) });
        } else {
            console.log("getting data from database");
            const users = await User.find();
            // Save the users data in the cache

            await client.set('users', JSON.stringify(users), {
                EX: DEFAULT_EXPIRATION,
                NX: true
              });
            return res.status(200).json({ users });
        }
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getUser = async (req, res) => {
    try {
        const client = await connectToRedis();
        const { id } = req.params;
        const cachedUser = await client.get(id);

        if (cachedUser) {
            console.log("getting data from cache");
            return res.status(200).json({ user: JSON.parse(cachedUser) });
        } else {
            const user = await User.findById(id);
            if (user) {
                await client.set(id, JSON.stringify(user), {
                    EX: DEFAULT_EXPIRATION,
                    NX: true
                });
                return res.status(200).json({ user });
            }

            return res.status(404).send("User with the specified ID does not exists");
        }

    } catch (error) {
        return res.status(500).send(error.message);
    }
};

const deleteUser = async (req, res) => {
    try {
        const client = await connectToRedis();
        const { id } = req.params;
        const cachedPhoto = await client.get(id);
        const deleted = await User.findByIdAndDelete(id);
        
        if (deleted) {
            if (cachedPhoto){
                await client.del(id);
            }
            return res.status(200).send("User deleted");
        }
        throw new Error("User not found");

    } catch (error) {
        return res.status(500).send(error.message);
    }
};

const updateUser = async (req, res) => {
    try {
        const client = await connectToRedis();
        const { id } = req.params;
        const cachedUser = await client.get(id);
        const updated = await User.findByIdAndUpdate(id, req.body)

        if (updated) {
            const user = await User.findById(id);
            if (cachedUser) {
                await client.del(id);
                await client.set(id, JSON.stringify(user), {
                    EX: DEFAULT_EXPIRATION,
                    NX: true
                });
            }
            return res.status(200).json({ user });
        }

        throw new Error("User not found");

    } catch (error) {
        return res.status(500).send(error.message);
    }
};

  
// add profile picture
const addProfilePicture = async (req, res) => {
    try {
        const { id } = req.params;

        // Use upload middleware before updating the user
        upload.single('profilePicture')(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }

            const { username, email } = req.body;
            let profileImage;

            // Access the uploaded image path if it exists
            if (req.file) {
                profileImage = req.file.path;
            }

            const updatedUser = await User.findByIdAndUpdate(
                id,
                { username, email, profileImage },
                { new: true } // Return the updated user document
            );

            if (updatedUser) {
                return res.status(200).json({ user: updatedUser });
            }
            throw new Error("User not found");
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getUsers,
    getUser,
    deleteUser,
    updateUser,
    addProfilePicture
};

