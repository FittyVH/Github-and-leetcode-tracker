const express = require('express')
const authControllers = require('../controllers/auth.controller')
const router = express.Router()

// redirect route
router.route("/github").get(authControllers.redirectToGitHub)
router.get("/github/callback", authControllers.githubCallback);
router.get('/github/me', authControllers.getMe);

module.exports = router