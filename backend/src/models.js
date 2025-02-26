const express = require('express');
// models.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// User Schema
const userSchema = new Schema({ 
    // not make it unique because we want to handle the google login conflict case
    username: { type: String, required: true }, 
    salt: { type: String}, 
    hash: { type: String},
    authProvider: { 
        google: { type: String }, // Google provider ID (e.g., googleId)
        local: { type: String } // Local username for local login
    },
});

const User = mongoose.model('User', userSchema);

// Profile Schema
const profileSchema = new Schema({
    username: { type: String, required: true, unique: true },
    headline: { type: String, default: "Hello!" },
    email: { type: String, required: true },
    phone: { type: String },
    zipcode: { type: String },
    dob: { type: Date, required: true },
    avatar: { type: String, default: "" },
    following: { type: [String], default: []},
});

const Profile = mongoose.model('Profile', profileSchema);
const CommentSchema = new mongoose.Schema({
    id: { type: String, required: true },
    text: { type: String, required: true },
    author: { type: String, required: true },
});

const ArticleSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    author: { type: String, required: true },
    text: { type: String, required: true },
    comments: [CommentSchema],
    date: { type: Date, default: Date.now },
    image: { type: String }, // Optional field for avatar or image
});

const Articles = mongoose.model('Articles', ArticleSchema);

module.exports = { User, Profile, Articles };
