const express = require('express');

// session.js: This will store the session data (sessionUser)
const sessionUser = {};  // In-memory session store

// Function to add a session
function createSession(sessionId, username) {
    sessionUser[sessionId] = { username };
}

// Function to get a session by ID
function getSession(sessionId) {
    return sessionUser[sessionId];
}

// Function to destroy a session
function destroySession(sessionId) {
    delete sessionUser[sessionId];
}

module.exports = { createSession, getSession, destroySession, sessionUser };
