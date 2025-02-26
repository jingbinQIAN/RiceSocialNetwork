const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const {User, Profile} = require('./models'); // Adjust the path as needed



function getRandomDate(start, end) {
    const startDate = start.getTime(); // Convert start date to milliseconds
    const endDate = end.getTime(); // Convert end date to milliseconds
    const randomTime = Math.random() * (endDate - startDate) + startDate; // Random time between start and end
    return new Date(randomTime); // Convert back to a Date object
}


// Helper function to resolve username conflicts
async function resolveUsernameConflict(baseUsername, provider) {
    let newUsername = baseUsername;
    let counter = 1;

    while (await User.findOne({ username: newUsername })) {
        newUsername = `${baseUsername}-${provider}-${counter}`;
        counter++;
    }

    return newUsername;
}


passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.NODE_ENV === 'production'
            ? 'https://comp531finalwebproject-c7f61df603db.herokuapp.com/auth/google/callback'
            : 'http://localhost:3000/auth/google/callback',
            //passReqToCallback: true // Important for accessing req in callback
        },
        async (accessToken, refreshToken, profile, done) => {
            try {

                let resolvedUsername = `${profile.name.givenName}-${profile.id.slice(0, 5)}`; // Ensure uniqueness

                // Check if a user with this Google ID already exists
                let user = await User.findOne({ "authProvider.google" : profile.id});

                if (!user) {

                    // If user doesn't exist, create a new one
                    user = new User({
                        username: resolvedUsername,
                        authProvider: { google: profile.id },
                    });
                    await user.save();
                    
                    // Set the range for the date of birth
                    const startDate = new Date('1980-01-01');
                    const endDate = new Date('2010-10-31');

                    // Generate a random date
                    const randomDob = getRandomDate(startDate, endDate);

                    profile = new Profile({
                        username: resolvedUsername,
                        email: profile.emails[0].value,
                        dob: randomDob,
                    });
                    await profile.save();
                }

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

// Serialize and deserialize user
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

module.exports = passport;