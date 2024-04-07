const User = require('../models/user.model');

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
// const addProfilePicture = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const user = await User.findById(id);
//         if (user) {
//             user.profileImage = req.file.path;
//             await user.save();
//             return res.status(200).json({ user });
//         }
//         return res.status(404).send("User with the specified ID does not exists");
//     } catch (error) {
//         return res.status(500).send(error.message);
//     }
// };


module.exports = {
    getUsers,
    getUser,
    deleteUser,
    updateUser,
    // addProfilePicture
};

