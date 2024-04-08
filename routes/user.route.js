const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/user.controller');
const { getUsers, getUser, deleteUser, updateUser, addProfilePicture } = require('../controllers/user.controller');



router.get('/', auth, getUsers);

router.get('/:id', auth, getUser);

router.delete('/:id', auth, deleteUser);

router.put('/:id', auth, updateUser);

router.put('/profilePicture/:id', auth, addProfilePicture);


module.exports = router;

