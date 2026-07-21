const express = require('express')
const authControllers = require('../controllers/auth.controller')
const router = express.Router()

const authMiddlewares = require('../middlewares/auth.middleware')

// redirect route
router.route("/github").get(authControllers.redirectToGitHub)
router.get("/github/callback", authControllers.githubCallback);
router.get('/github/me', authControllers.getMe);
router.put('/leetcode', authMiddlewares.authUser, authControllers.updateLeetCode);

module.exports = router