const express = require('express');
const router = express.Router();
const { User, Profile } = require('./models');

// // Dummy data for following, where each user has their own following list
// const userFollowingData = {
//     joey: { following: ['RDesRoches', 'JaneDoe'] },
//     RDesRoches: { following: ['JaneDoe', 'joey'] },
//     JaneDoe: { following: ['RDesRoches'] },
// };


router.get('/following/:user?', async (req, res) => {
    const username = req.params.user || req.loggedInUser; // Use loggedInUser from session or params
    const profile = await Profile.findOne({ username });
    if (profile) {
        res.send({ username: username, following: profile.following })
    } else {
        res.status(404).send({ error: 'User not found' });
    }
});

router.put('/following/:user', async (req, res) => {
    const loggedInUser = req.loggedInUser; // Assume loggedInUser is available in the request context
    const { user } = req.params;

    // Check if the user exists and is not the same user trying to follow themselves
    if (user === loggedInUser) {
        return res.status(400).send({ error: 'You cannot follow yourself' });
    }

    const profile = await Profile.findOne({ username: loggedInUser });

    const checkprofile = await User.findOne({ username: user });
    if (!checkprofile){
        res.status(400).send({ error: 'This user is not in database, cannot follow.' });
    }
    else{
        if (!profile.following.includes(user)) {
            profile.following.push(user);
            await profile.save();
            res.send({
                username: loggedInUser,
                following: profile.following
            });
        }
        else {
            res.status(400).send({ error: 'Already following this user' });
        }
    }
    
});

// Remove a user from the following list for the logged-in user
router.delete('/following/:user', async (req, res) => {
    const loggedInUser = req.loggedInUser; // Assume loggedInUser is available in the request context
    const { user } = req.params;

    const profile = await Profile.findOne({ username: loggedInUser });
    if (!profile || !profile.following.includes(user)) {
        return res.status(404).send({ error: 'Not following this user' });
    }

    profile.following = profile.following.filter((u) => u !== user);
    await profile.save();
    res.send({
        username: loggedInUser,
        following: profile.following
    });
});

module.exports = router;
