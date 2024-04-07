const express = require('express');
const router = express.Router();
const photoController = require('../controllers/photo.controller');
const auth = require('../middleware/auth');
const { createPhoto, getAllPhotos, getPhoto, updatePhoto, deletePhoto } = require('../controllers/photo.controller');



router.post('/', auth, createPhoto);

router.get('/', getAllPhotos);

router.get('/:id', getPhoto);

router.put('/:id', auth, updatePhoto);

router.delete('/:id', auth, deletePhoto);



module.exports = router;

