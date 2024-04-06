require("dotenv").config();
require("./config/database").connect();
const express = require('express');
const app = express();
const User = require('./models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require("./middleware/auth");


//middleware
app.use(express.json());
app.use(express.urlencoded({extended: false}));

//routes
app.get('/', (req, res) => {
    console.log('Hello World');
    res.send('Hello World');
});

//for testing the token validator

app.post("/welcome", auth, (req, res) => {

 res.status(200).send("Welcome ");

});

//get all users for testing purposes
app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        return res.status(200).json({ users });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});


app.post('/register', async (req, res) => {
    //registration logic
    const { username, password, email, profileImage } = req.body;

    if(!username || !password || !email) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    //check if old user already exist in the database
    const oldUser = await User.findOne({ email });
    if (oldUser) {
        return res.status(409).json({ error: 'User already exists' });
    }

    //encrypted password
    const encryptedPassword = await bcrypt.hash(password, 10);


    try {
        const user = await User.create({ 
            username, 
            password : encryptedPassword, 
            email: email.toLowerCase(), 
            profileImage 
        });

        //create a token
        const token = jwt.sign(
            {user_id: user._id, email},
            process.env.TOKEN_KEY,
            {
            expiresIn: "2h",
            }
        )
        // save user token
        user.token = token;
        console.log('User: ', user.token);

        return res.status(201).json({ user });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }

});

app.post('/login', async (req, res) => {
    //login logic
    const { email, password } = req.body;

    if(!email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const user = await User.findOne({ email });
        // if (!user) {
        //     return res.status(404).json({ error: 'User not found' });
        // }
        if (user && bcrypt.compare(password, user.password)) {
            console.log('User : ', bcrypt.compare(password, user.password))
            //create a token
            const token = jwt.sign(
                {user_id: user._id, email},
                process.env.TOKEN_KEY,
                {
                expiresIn: "2h",
                }
            )
            // save user token
            user.token = token;

            return res.status(200).json({user});
        }
        else {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }

});


app.listen(3000, () => {
    try {
        console.log('Server is running on port 3000');
    }
    catch (error) {
        console.log('Error: ', error);
    }

})
