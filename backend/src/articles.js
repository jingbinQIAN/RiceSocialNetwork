const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const uploadImage = require('./uploadCloudinary');
const {Profile, Articles} = require('./models'); // Import the Article model

// Ensure the uploads directory exists for article post optional image
const uploadDir = path.join(__dirname, 'pictures');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Mock Some Posts to db when initialization
const posts = {
    createarticles: async function(id, author, text, comments, date) {
        // Check if posts already initialized
        const existingPost = await Articles.findOne({ id });
        if (!existingPost) {
            const newArticle = new Articles({
                id: id,
                author: author,
                text: text,
                comments: comments,
                date: date,
            });
            await newArticle.save();
        }
    }
};

const axios = require('axios');

// Function to fetch and create articles
async function fetchAndCreateArticles() {
    try {
        // Fetch data from API
        const url = "https://jsonplaceholder.typicode.com/posts";
        const response = await axios.get(url);

        if (response.status !== 200) {
            throw new Error("Failed to fetch data from the API");
        }

        const posts1 = response.data;

        // Map userId to username
        const userMapping = {
            1: "Bret",
            2: "Antonette",
            3: "Samantha",
            4: "Karianne",
            5: "Kamren",
            6: "Leopoldo_Corkery",
            7: "Elwyn.Skiles",
            8: "Maxime_Nienow",
            9: "Delphine",
            10: "Moriah.Stanton"
        };

        // Iterate over each post and create articles
        posts1.forEach((post) => {
            const author = userMapping[post.userId];
            const comments = [
                { id: "1", text: `Great article, ${author}!`, author: "JaneDoe" },
                { id: "2", text: "I totally agree with your points.", author: "RDesRoches" }
            ];
            const timestamp = Date.now();

            posts.createarticles(
                post.id,
                author,
                post.body,
                comments,
                timestamp
            );  
        });
    } catch (error) {
        console.error("Error:", error.message);
    }
}

// Call the function
fetchAndCreateArticles();


// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Save to 'uploads' directory
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix); // Set unique file name
    }
});

const upload = multer({ storage: storage });


router.get('/articles/:id?', async (req, res) => {
    const { id } = req.params;
    const loggedInUser = req.loggedInUser;

    if (id) {
        // Check if the ID is a number
        const isNumber = !isNaN(id); // true if `id` can be converted to a number

        // Validate the ID format
        if (isNumber) {
            // Convert `id` to a number if it should be numeric
            const numericId = parseInt(id, 10);

            // If `id` is a number, search by `id`
            const article = await Articles.findOne({ id: numericId });
            if (article) {
                return res.send({ articles: [article] });
            }
        } else {
            // If `id` is not numeric, assume it might be an author's name
            const article = await Articles.find({ author: id });
            if (article) {
                return res.send({ articles: [article] });
            }
        }

        // If no article is found
        return res.status(404).send({ error: 'Article not found' });
    } else {
        // Fetch the profile of the logged-in user to get their followers
        const userProfile = await Profile.findOne({ username: loggedInUser });
        if (!userProfile) {
            return res.status(404).send({ error: 'User profile not found' });
        }

        // Include the logged-in user and their followers in the query
        const authors = [loggedInUser, ...userProfile.following];

        // Fetch all articles from the logged-in user and their followers
        const userArticles = await Articles.find({ author: { $in: authors } });
        return res.send({ articles: userArticles });
    }
});

// Update an article's text or a comment within an article
router.put('/articles/:id', async (req, res) => {
    const { id } = req.params;
    const { text, commentId } = req.body;
    const loggedInUser = req.loggedInUser;

    const article = await Articles.findOne({ id });

    // Check if the article exists
    if (!article) {
        return res.status(404).send({ error: 'Article not found' });
    }

    // If a commentId is supplied
    if (commentId !== undefined) {
        if (commentId === "-1") {
            // Add a new comment (no ownership check)
            const newComment = {
                id: (article.comments.length + 1).toString(), // Automatically generate a new comment ID
                text,
                author: loggedInUser // Track who added the comment
            };
            article.comments.push(newComment);
            await article.save();
            return res.send({ article });
        } else {
            // Update existing comment
            const comment = article.comments.find(c => c.id === commentId);

            if (!comment) {
                return res.status(404).send({ error: 'Comment not found' });
            }

            // Only allow the comment's author to update the comment
            if (comment.author !== loggedInUser) {
                return res.status(403).send({ error: 'Forbidden: You can only update your own comments' });
            }

            // Update the comment text
            comment.text = text;
            await article.save();
            return res.send({ article });
        }
    } else {
        // Update the article's text if no commentId is provided
        if (article.author !== loggedInUser) {
            return res.status(403).send({ error: 'Forbidden: You can only update your own articles' });
        }
        article.text = text;
        await article.save();
        return res.send({ article });
    }
});

router.post('/article', uploadImage('image'), async (req, res) => {
    const { text } = req.body;
    const loggedInUser = req.loggedInUser;
    ///////

    // Validate that the text is not empty
    if (!text || text.trim().length === 0) {
        return res.status(400).send({ error: 'Article text is required' });
    }

    const newArticle = new Articles({
        id: await Articles.countDocuments() + 1, // Auto-increment ID
        author: loggedInUser,
        text,
        comments: [],
        date: Date.now(),
    });

    // Add the image URL if it was uploaded
    if (req.fileurl) {
        newArticle.image = req.fileurl;
    }

    await newArticle.save();

    // Fetch the profile of the logged-in user to get their followers
    const userProfile = await Profile.findOne({ username: loggedInUser });
    if (!userProfile) {
        return res.status(404).send({ error: 'User profile not found' });
    }

    // Include the logged-in user and their followers in the query
    const authors = [loggedInUser, ...userProfile.following];

    // Query for all articles by the logged-in user
    const userArticles = await Articles.find({ author: authors });

    // Respond with both the new article and the total articles by the logged-in user
    res.send({ articles: userArticles });
});


router.get('/allarticles', async (req, res) => {
    // If no ID is specified, return all articles
    try {
        const allArticles = await Articles.find(); // Fetch all articles from the Articles collection
        return res.send({ articles: allArticles });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ error: 'Failed to fetch articles' });
    }
});


module.exports = router;
