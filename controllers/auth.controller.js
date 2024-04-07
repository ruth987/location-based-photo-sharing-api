const User = require('../models/user.model');

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    const { username, password, email, profileImage } = req.body;

    if(!username || !password || !email) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    // checking length of username
    if (username.length < 3 || username.length > 20) {
        return res.status(400).json({ error: 'Username must be between 3 and 20 characters' });
    }

    // Validate email format using a regular expression:
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    //check if old user already exist in the database
    const oldUser = await User.findOne({ email });
    if (oldUser) {
        return res.status(409).json({ error: 'this email address is already in use' });
    }

     // Validate password strength using a regular expression:
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{6,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ error: 'Password must be at least 6 characters and contain at least one lowercase letter, one uppercase letter, one digit, and one special character' });
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
        );

        return res.status(201).json({ user });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }

};

const login = async (req, res) => {
    const { email, password } = req.body;

    if(!email || !password) {
        // console.log('getting here');
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Create a token 
        const token = jwt.sign(
            { user_id: user._id, email },
            process.env.TOKEN_KEY,
            { expiresIn: "2h" }
        );

        // Send token in response
        return res.status(200).json({ token }); 
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }

};

module.exports = {
    register,
    login
};



/** 
app.post('/register', async (req, res) => {

    const { username, password, email, profileImage } = req.body;

    if(!username || !password || !email) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    // checking length of username
    if (username.length < 3 || username.length > 20) {
        return res.status(400).json({ error: 'Username must be between 3 and 20 characters' });
    }

    // Validate email format using a regular expression:
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    //check if old user already exist in the database
    const oldUser = await User.findOne({ email });
    if (oldUser) {
        return res.status(409).json({ error: 'this email address is already in use' });
    }

     // Validate password strength using a regular expression:
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{6,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ error: 'Password must be at least 6 characters and contain at least one lowercase letter, one uppercase letter, one digit, and one special character' });
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
        );

        return res.status(201).json({ user });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }

});

app.post('/login', async (req, res) => {

    const { email, password } = req.body;

    if(!email || !password) {
        // console.log('getting here');
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Create a token 
        const token = jwt.sign(
            { user_id: user._id, email },
            process.env.TOKEN_KEY,
            { expiresIn: "2h" }
        );

        // Send token in response
        return res.status(200).json({ token }); 
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }

});
*/