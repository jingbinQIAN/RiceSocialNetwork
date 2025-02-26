const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');
const { User, Profile } = require('./models');
// Import the Cloudinary upload function
const uploadImage = require('./uploadCloudinary');
const { destroySession, getSession } = require('./session');

const fs = require('fs');

// Ensure the uploads directory exists for avatar
const uploadDir = path.join(__dirname, 'pictures');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
// Helper function to generate salt
const generateSalt = () => {
    return crypto.randomBytes(16).toString('hex'); // Random 16-byte salt
};

// Helper function to hash password with salt
const hashPassword = (password, salt) => {
    return crypto.createHmac('sha256', salt).update(password).digest('hex');
};




router.get('/email/:user?', async (req, res) => {
    const username = req.params.user|| req.loggedInUser;
    const profile = await Profile.findOne({ username });
    if (profile) {
        res.send({ username: username, email: profile.email });
    } else {
        res.status(404).send({ error: 'User not found' });
    }
});


// Get the headline for a user
router.get('/headline/:user?', async (req, res) => {
    const username = req.params.user || req.loggedInUser;
    const profile = await Profile.findOne({ username });
    if (profile) {
        res.send({ username, headline: profile.headline });
    }
    else {
        res.status(404).send({ error: 'User not found' });
    }
});

// Update the headline for the logged-in user
router.put('/headline', async (req, res) => {
    const { headline } = req.body;
    const loggedInUser = req.loggedInUser;


    const profile = await Profile.findOne({ username: loggedInUser });
    if (!profile) {
        res.status(404).send({ error: 'User not found' });
    }
    else{
        profile.headline = headline;
        await profile.save();
        res.send({ username: loggedInUser, headline });
    }
});

// Get the email address for the requested user
router.get('/email/:user?', async (req, res) => {
    const username = req.params.user || req.loggedInUser;
    const profile = await Profile.findOne({ username: username });
    if (profile) {
        res.send({ username, email: profile.email });
    } else {
        res.status(404).send({ error: 'User not found' });
    }
});

// Update the email address for the logged-in user
router.put('/email', async (req, res) => {
    const { email } = req.body;
    const loggedInUser = req.loggedInUser;
    const profile = await Profile.findOne({ username: loggedInUser });

    if (!profile ) {
        return res.status(404).send({ error: 'User not found' });
    }

    profile.email = email;
    await profile.save();
    res.send({ username: loggedInUser, email });
});

// Get the zipcode for the requested user
router.get('/zipcode/:user?', async (req, res) => {
    const username = req.params.user || req.loggedInUser;
    const user = await Profile.findOne({ username: username });
    if (user) {
        res.send({ username, zipcode: user.zipcode });
    } else {
        res.status(404).send({ error: 'User not found' });
    }
});

// Update the zipcode for the logged-in user
router.put('/zipcode', async (req, res) => {
    const { zipcode } = req.body;
    const loggedInUser = req.loggedInUser;

    const profile = await Profile.findOne({ username: loggedInUser });
    
    if (!profile) {
        return res.status(404).send({ error: 'User not found' });
    }

    profile.zipcode = zipcode;
    await profile.save();
    res.send({ username: loggedInUser, zipcode });
});

// Get the date of birth for the requested user
router.get('/dob/:user?', async (req, res) => {
    const username = req.params.user || req.loggedInUser;

    const profile = await Profile.findOne({ username: username });
    if (profile) {
        res.send({ username, dob: profile.dob });
    } else {
        res.status(404).send({ error: 'User not found' });
    }
});
// Serve static files from 'uploads' directory
router.use('/pictures', express.static(path.join(__dirname, 'pictures')));

// Get the avatar for the requested user
router.get('/avatar/:user?', async (req, res) => {
    const username = req.params.user || req.loggedInUser;

    const profile = await Profile.findOne({ username: username });
    if (profile) {
        res.send({ username, avatar: profile.avatar });
    } else {
        res.status(404).send({ error: 'User not found' });
    }
});
//
// Update the avatar for the logged-in user
router.put('/avatar', uploadImage('image'), async (req, res) => {
    // If no file was uploaded, send an error
    if (!req.fileurl) {
        return res.status(400).send({ error: 'No file uploaded' });
    }

    const loggedInUser = req.loggedInUser;
    const profile = await Profile.findOne({ username: loggedInUser });
    if (!profile) {
        return res.status(404).send({ error: 'User not found' });
    }

    profile.avatar = req.fileurl;
    await profile.save();
    res.send({ username: loggedInUser, avatar: req.fileurl});
});

// Update the password for the logged-in user
router.put('/password', async (req, res) => {
    const { password } = req.body;
    const loggedInUser = req.loggedInUser;

    const user = await User.findOne({ username: loggedInUser });

    if (!user) {
        return res.status(404).send({ error: 'User not found' });
    }

    // Generate salt and hash password
    const salt = generateSalt();
    const hashedPassword = hashPassword(password, salt);

    user.salt = salt;
    user.hash = hashedPassword;
    await user.save();
    res.send({ username: loggedInUser, result: 'success' });
});

// Get the phone number for the requested user
router.get('/phone/:user?', async (req, res) => {
    const username = req.params.user || req.loggedInUser;

    const profile = await Profile.findOne({ username: username });
    if (profile) {
        res.send({ username: username, phone: profile.phone });
    } else {
        res.status(404).send({ error: 'User not found' });
    }
});

// Update the phone number for the logged-in user
router.put('/phone', async (req, res) => {
    const { phone } = req.body;
    const loggedInUser = req.loggedInUser;

    const profile = await Profile.findOne({ username: loggedInUser });
    if (!profile) {
        return res.status(404).send({ error: 'User not found' });
    }

    profile.phone = phone;
    await profile.save();
    res.send({ username: loggedInUser, phone });
});

// Link local account to Google account
router.put('/link', async (req, res) => {
    const loggedInUser = req.loggedInUser;
    const { localusername, localpassword, googleId } = req.body;

    const googleUser = await User.findOne({ username: loggedInUser});
    const googleProfile = await Profile.findOne({ username: loggedInUser});
    if (!googleUser) {
        return res.status(403).send({ error: 'Only Google users can link a local account.' });
    }

    console.log("local username: ", localusername);
    console.log("local password: ", localpassword);
    
    

    const localAccount = await User.findOne({ username: localusername});
    
    console.log("local account: ", localAccount);
    if (localAccount){
        const hashedlocalPassword = hashPassword(localpassword, localAccount.salt);
        if (!localAccount || hashedlocalPassword != localAccount.hash ) {
            return res.status(404).send({ error: 'Invalid Account or Password' });
        }
    
        // Merge Google account info to local account
        localAccount.authProvider.google = googleId;
    
        await localAccount.save();

        // Delete the Google user document
        await User.deleteOne({ _id: googleUser._id }); // Updated line
        await Profile.deleteOne({ _id: googleProfile._id }); // Updated line
    
        const sessionKey = req.cookies["sid"];
    
    
        if (sessionKey && getSession(sessionKey)) {
            destroySession(sessionKey);
        }
        res.clearCookie("sid"); // Clear session cookie
    
        res.send({ success: true, message: 'Local account linked successfully.' });
    }
    else{
        return res.status(403).send({ error: 'No This Local Account' });
    }
    

});

// Unlink local account
router.put('/unlink', async (req, res) => {
    const loggedInUser = req.loggedInUser;

    const user = await User.findOne({ username: loggedInUser});
    if (!user.authProvider.google) {
        return res.status(400).send({ error: 'No Google account to unlink.' });
    }

    // Unlink the Google account
    user.authProvider.google = undefined; // Remove only the `google` field
    await user.save();

    res.send({ success: true, message: 'Local account unlinked successfully.' });
});


// Unlink local account
router.get('/authprovider', async (req, res) => {
    const loggedInUser = req.loggedInUser;

    const user = await User.findOne({ username: loggedInUser});
    if (user){
        res.send({ provider: user.authProvider });
    }
    else{
        res.status(404).send({ error: 'User not found' });
    }
    
});


module.exports = router;
