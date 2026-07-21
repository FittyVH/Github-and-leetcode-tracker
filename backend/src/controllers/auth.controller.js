const userModel = require('../models/user.model')
const jwt = require('jsonwebtoken')

// send user to the github login page
async function redirectToGitHub(req, res) {
    const redirectUri = "http://localhost:3000/api/auth/github/callback"
    const url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=user:email`

    res.redirect(url)
}

async function githubCallback(req, res) {
    console.log("Callback hit");
    const { code } = req.query

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

    const userData = await fetch("https://api.github.com/user", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
            Accept: "application/json"
        }
    })

    const githubUser = await userData.json()

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

    // send the token to cookie storage
    res.cookie("token", token, {
        httpOnly: true, // Prevents client-side scripts from stealing the token (Security best practice)
        path: "/", // all api paths will be able to read this cookie
        sameSite: "lax", 
        secure: false        // Makes sure the cookie is sent for ALL backend routes
    })

    res.redirect("http://localhost:5173")
}

// get user status, logged in or not
async function getMe(req, res){
    try {
        const token = req.cookies.token;

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