const userModel = require('../models/user.model')
const jwt = require('jsonwebtoken')

// send user to the github login page
async function redirectToGitHub(req, res) {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";
    const redirectUri = `${backendUrl}/api/auth/github/callback`;
    const url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=user:email`;

    res.redirect(url)
}

async function githubCallback(req, res) {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    try {
        console.log("Callback hit");
        const { code } = req.query

        if (!code) {
            console.error("No code received from GitHub");
            return res.redirect(`${frontendUrl}?error=no_code`);
        }

        // we post the clientId and secret to github to verify
        // response returns a promise to the request object, you can console it to see whats inside
        const response = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            body: JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code
            }),
            headers: {
                Accept: "application/json", // i want in json format
                "Content-Type": "application/json" // i am sending in json format
            }
        })

        const tokenData = await response.json() // we convert it into a json object

        // Guard: GitHub rejected the code (expired, already used, wrong client, etc.)
        if (tokenData.error || !tokenData.access_token) {
            console.error("GitHub token exchange failed:", tokenData.error, tokenData.error_description);
            return res.redirect(`${frontendUrl}?error=token_exchange_failed`);
        }

        const userData = await fetch("https://api.github.com/user", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
                Accept: "application/json"
            }
        })

        const githubUser = await userData.json()

        // Guard: GitHub user fetch failed
        if (!githubUser.id) {
            console.error("Failed to fetch GitHub user profile:", githubUser);
            return res.redirect(`${frontendUrl}?error=user_fetch_failed`);
        }

        let user = await userModel.findOne({ githubId: githubUser.id.toString() })

        // if the user does NOT exist, create their account
        if (!user) {
            console.log("First time user! Creating record...")
            user = await userModel.create({
                githubId: githubUser.id.toString(),
                username: githubUser.login,
                avatarUrl: githubUser.avatar_url
            })
        } else {
            console.log("Returning user! Skipping account creation...")
        }

        // create a token
        const token = jwt.sign({
            id: user._id
        }, process.env.JWT_SECRET)

        // Pass token in URL since frontend and backend are on different origins (cross-origin cookie is blocked)
        res.redirect(`${frontendUrl}?token=${token}`);
    } catch (error) {
        console.error("Unexpected error in GitHub callback:", error);
        res.redirect(`${frontendUrl}?error=server_error`);
    }
}

// get user status, logged in or not
async function getMe(req, res){
    try {
        // Support both cookie-based (local) and Authorization header-based (production cross-origin) tokens
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ error: "No session token found. Unauthorized." });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtErr) {
            return res.status(401).json({ error: "Invalid session token. Unauthorized." });
        }

        const user = await userModel.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ error: "User record not found." });
        }

        return res.status(200).json(user);

    } catch (error) {
        console.error("Error in /me endpoint:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
}

function parseLeetCodeUsername(input) {
    if (!input || typeof input !== 'string') return null;
    let trimmed = input.trim();
    if (!trimmed) return null;

    if (trimmed.includes('leetcode.com')) {
        try {
            const urlString = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
            const parsedUrl = new URL(urlString);
            const pathname = parsedUrl.pathname.replace(/\/+$/, '');
            const parts = pathname.split('/').filter(Boolean);
            
            if (parts.length > 0) {
                const lastPart = parts[parts.length - 1];
                if (lastPart !== 'u') {
                    return lastPart;
                }
            }
        } catch (e) {
            const match = trimmed.match(/leetcode\.com\/(?:u\/)?([a-zA-Z0-9_-]+)/);
            if (match && match[1]) return match[1];
        }
    }

    return trimmed.replace(/^@/, '');
}

async function updateLeetCode(req, res) {
    try {
        const { leetcodeUrl, leetcodeUsername } = req.body;
        const rawInput = leetcodeUrl || leetcodeUsername;

        if (!rawInput) {
            return res.status(400).json({ message: "LeetCode URL or username is required" });
        }

        const extractedUsername = parseLeetCodeUsername(rawInput);

        if (!extractedUsername) {
            return res.status(400).json({ message: "Invalid LeetCode URL or username format" });
        }

        const userId = req.user.id;
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.leetcodeUsername = extractedUsername;
        await user.save();

        res.status(200).json({
            message: "LeetCode profile updated successfully!",
            user
        });
    } catch (err) {
        console.error("Error updating LeetCode profile:", err);
        res.status(500).json({ message: "Server error updating LeetCode profile" });
    }
}

module.exports = { redirectToGitHub, githubCallback, getMe, updateLeetCode }