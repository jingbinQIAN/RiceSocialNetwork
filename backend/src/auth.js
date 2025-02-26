const express = require('express');
const router = express.Router();

const crypto = require('crypto');
const md5 = require('md5');
// Import session management
const { destroySession, createSession, getSession } = require('./session');

const mongoose = require('mongoose');
const { User, Profile } = require('./models');

const cookieKey = 'sid';
const mySecretMessage = 'super-secret-message'; 

// Import the uuid library to generate unique ids (follow the requirements)
const {v4 : uuidv4} = require('uuid');

// Helper function to generate salt
const generateSalt = () => {
    return crypto.randomBytes(16).toString('hex'); // Random 16-byte salt
};

// Helper function to hash password with salt
const hashPassword = (password, salt) => {
    return crypto.createHmac('sha256', salt).update(password).digest('hex');
};


// This is to automatically add some user when the app starts.
const auth = {
    register: async function(username, email, dob, phone, zipcode, password, followers) {
        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (!existingUser) {
            // Generate salt and hash password
            const salt = generateSalt();
            const hashedPassword = hashPassword(password, salt);
        
            // Create new user and save to DB
            const newUser = new User({
                username,
                salt,
                hash: hashedPassword,
                authProvider: { local: username },
            });
            await newUser.save();

            // Create corresponding profiles
            const newProfile = new Profile({
                username,
                email,
                dob,
                phone,
                zipcode,
                following: followers
            });
            await newProfile.save();
        }
    }
};
auth.register('Bret', 'Sincere@april.biz', '1990-01-01', '770-736-8031', '92998', 'Kulas Light', ["Antonette", "Samantha", "Karianne"]);
auth.register('Antonette', 'Shanna@melissa.tv', '1995-03-15', '010-692-6593', '90566', 'Victor Plains', ["Samantha", "Karianne", "Kamren"])
auth.register('Samantha', 'Nathan@yesenia.net', '1998-07-24', '463-123-4447', '59590', 'Douglas Extension', ["Karianne", "Kamren", "Leopoldo_Corkery"]);
auth.register('Karianne', 'Julianne.OConner@kory.org', '1997-05-30', '493-170-9623', '53919', 'Hoeger Mall', ["Kamren", "Leopoldo_Corkery", "Elwyn.Skiles"]);
auth.register('Kamren', 'Lucio_Hettinger@annie.ca', '2002-08-10', '254-954-1289', '33263', 'Skiles Walks', [ "Leopoldo_Corkery", "Elwyn.Skiles", "Maxime_Nienow"]);
auth.register('Leopoldo_Corkery', 'Karley_Dach@jasper.info', '1994-11-22', '477-935-8478', '23505', 'Norberto Crossing', [ "Elwyn.Skiles", "Maxime_Nienow", "Delphine"]);
auth.register('Elwyn.Skiles', 'Telly.Hoeger@billy.biz', '1996-09-18', '210-067-6132', '58804', 'Rex Trail', [ "Maxime_Nienow", "Delphine", "Moriah.Stanton"]);
auth.register('Maxime_Nienow', 'Sherwood@rosamond.me', '2001-01-11', '586-493-6943', '45169', 'Ellsworth Summit', ["Delphine", "Moriah.Stanton", "Bret"]);
auth.register('Delphine', 'Chaim_McDermott@dana.io', '1999-04-05', '775-976-6794', '76495', 'Dayna Park', ["Moriah.Stanton", "Bret", "Antonette"]);
auth.register('Moriah.Stanton', 'Rey.Padberg@karina.biz', '2000-06-12', '024-648-3804', '31428', 'Kattie Turnpike', ["Bret", "Antonette", "Samantha"]);

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({ username });

    if (!user) {
        return res.status(401).send({ error: 'Invalid username or password' });
    }

    // Hash the password provided by the user and compare it with the stored hash
    const hashedPassword = hashPassword(password, user.salt);
    if (hashedPassword !== user.hash) {
        return res.status(401).send({ error: 'Invalid username or password' });
    }

    // Generate a secure session key
    const sessionKey = md5(mySecretMessage + new Date().getTime() + user.username);

    // Use createSession function to store session
    createSession(sessionKey, user.username);

    // this sets a cookie
    res.cookie(cookieKey, sessionKey, { maxAge: 3600*1000, httpOnly: true, sameSite: 'None', secure: true});

    res.send({ result: 'success', username });
});

router.put('/logout', (req, res) => {
    const sessionKey = req.cookies[cookieKey];

    try {
        if (sessionKey && getSession(sessionKey)) {
            destroySession(sessionKey);
        }
        res.clearCookie(cookieKey); // Clear session cookie
        res.send({ result: 'OK' });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).send({ error: 'Logout failed' });
    }
});

router.post('/register', async (req, res) => {
    const { username, email, dob, phone, zipcode, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });

    
    if (existingUser) {
        return res.status(400).send({ error: 'User already exists' });
    }

     // Generate salt and hash password
     const salt = generateSalt();
     const hashedPassword = hashPassword(password, salt);
 
    // Create new user and save to DB
    const newUser = new User({
        username,
        salt,
        hash: hashedPassword,
        authProvider: { local: username },
    });
    await newUser.save();

    // Create profile document
    const newProfile = new Profile({
        username,
        email,
        dob,
        phone,
        zipcode
    });
    await newProfile.save();
    res.send({ result: 'success', username });
});

module.exports = router;
