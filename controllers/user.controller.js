const User = require('../models/user.model');
const upload = require('../middleware/multer');

const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        return res.status(200).json({ users });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (user) {
            return res.status(200).json({ user });
        }
        return res.status(404).send("User with the specified ID does not exists");
    } catch (error) {
        return res.status(500).send(error.message);
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await User.findByIdAndDelete(id);
        if (deleted) {
            return res.status(200).send("User deleted");
        }
        throw new Error("User not found");

    } catch (error) {
        return res.status(500).send(error.message);
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await User.findByIdAndUpdate(id, req.body)
        if (updated) {
            const user = await User.findById(id);
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

