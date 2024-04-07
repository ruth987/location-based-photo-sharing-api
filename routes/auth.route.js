const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authController = require('../controllers/auth.controller');
const { register, login } = require('../controllers/auth.controller');

  


router.post('/register', register);

router.post('/login', login);



module.exports = router;


