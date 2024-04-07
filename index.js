require("dotenv").config();
require("./config/database").connect();
const express = require('express');
const app = express();
const User = require('./models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require("./middleware/auth");
const verifyToken = require("./middleware/auth");
const photoRoute = require('./routes/photo.route.js');
const authRoute = require('./routes/auth.route.js');
const userRoute = require('./routes/user.route.js');


//middleware
app.use(express.json());
app.use(express.urlencoded({extended: false}));

//routes
app.use('/api/photos', photoRoute);
app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);

//for testing the token validator

app.post("/welcome", auth, (req, res) => {

 res.status(200).send("Welcome ");

});




app.listen(3000, () => {
    try {
        console.log('Server is running on port 3000');
    }
    catch (error) {
        console.log('Error: ', error);
    }

})
