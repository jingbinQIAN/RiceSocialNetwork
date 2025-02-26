const express = require('express');
//const session = require('express-session');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');  // For generating session keys
const { destroySession, createSession, getSession } = require('./src/session'); // Import session management
const { Profile } = require('./src/models');
const passport = require('./src/passport');
const cors = require('cors');
const session = require('express-session');
const md5 = require('md5');




const uri = "mongodb+srv://jq12:binbin118550@cluster0.fzqlw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const app = express();

// Connect to MongoDB Atlas
mongoose.connect(uri)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('Failed to connect to MongoDB Atlas:', err));


// Add session middleware for Passport
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'supersecretkey',
        resave: false,
        saveUninitialized: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,  // Ensures cookie is not accessible from JavaScript
            secure: process.env.NODE_ENV === 'production',   // Set to true if using HTTPS
            sameSite: 'None', // Allow cross-origin requests with cookies
            maxAge: 3600*1000,
            domain: process.env.COOKIE_DOMAIN || 'localhost' // Set appropriate domain
        },
    })
);
// Google Authentication Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get(
    '/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    async (req, res) => {
        try {
            // log req.user to see if it's set
            // // Generate a secure session key
            const sessionKey = md5("super-secret-message" + new Date().getTime() + req.user.username);

            // // Use createSession function to store session
            createSession(sessionKey, req.user.username);
            

            // Optionally, you can set a cookie here if needed
            res.cookie('sid', sessionKey, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'None',
                maxAge: 3600*1000
            });

            // res.send({ result: 'Google Success' });
            res.redirect('https://comp531finalproject.surge.sh/main'); // Redirect to Angular frontend
            // res.json({
            //     message: 'google login successful'
            // });
        } catch (error) {
            console.error('Error during Google authentication callback:', error);
            res.status(500).send('Internal Server Error');
        }
    }
);

app.get('/logout', (req, res) => {
    req.logout(err => {
        if (err) return res.status(500).send({ error: 'Failed to log out' });
        res.redirect('/');
    });
});


// Initialize Passport middleware
app.use(passport.initialize());
app.use(passport.session());

const helmet = require('helmet');

// Add helmet middleware for security
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                styleSrc: ["'self'", "https://fonts.googleapis.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
                connectSrc: ["'self'", "https://www.googleapis.com"], // For Google API calls
            },
        },
    })
);


// Session middleware
app.use(cookieParser());
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:4200', 'https://comp531finalwebproject-c7f61df603db.herokuapp.com/' , 'https://comp531finalproject.surge.sh'], // Angular app's URL
    credentials: true, // Allow cookies and credentials
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Accept', 'X-Requested-With']// Include necessary headers
}));

const isLoggedIn = async (req, res, next) => {
    // Exclude the login and register routes from session validation
    if (req.path === '/login' || req.path === '/register' || req.path.startsWith('/auth/google')) {
        return next(); // Skip session validation for these routes
    }
    console.log('Cookies:', req.cookies);
    // Check for local session
    const sessionId = req.cookies['sid'];
    console.log('getSession:', getSession(sessionId));
    console.log('testing:');
    if (sessionId && getSession(sessionId)) {
        const user = getSession(sessionId);
        const profile = await Profile.findOne({ username: user.username });
        
        if (profile) {
            req.loggedInUser = user.username;
            req.userProfile = profile;
            return next();
        }
    }
///
    // // Check for Passport/Google authentication
    // if (req.isAuthenticated()) {
    //     req.loggedInUser =  || req.user.email;
    //     return next();
    // }

    // If no authentication is found
    return res.status(401).send({ error: 'Unauthorized. Please Log In First.' });
};

app.use(isLoggedIn);

const authRoutes = require('./src/auth');
const articleRoutes = require('./src/articles');
const profileRoutes = require('./src/profile');
const followingRoutes = require('./src/following');


app.use(authRoutes);
app.use(articleRoutes);
app.use(profileRoutes);
app.use(followingRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
