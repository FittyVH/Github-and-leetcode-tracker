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
            return res.send(buildTransferPage(frontendUrl, null, 'no_code'));
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
            return res.send(buildTransferPage(frontendUrl, null, 'token_exchange_failed'));
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
            return res.send(buildTransferPage(frontendUrl, null, 'user_fetch_failed'));
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

        // Instead of a plain redirect (which Chrome flags as bounce tracking),
        // serve an HTML page that actively writes to localStorage before navigating.
        // This "storage interaction" satisfies Chrome's Bounce Tracking Mitigation check,
        // signalling that this origin is a legitimate participant, not a passive tracker.
        res.send(buildTransferPage(frontendUrl, token, null));
    } catch (error) {
        console.error("Unexpected error in GitHub callback:", error);
        res.send(buildTransferPage(frontendUrl, null, 'server_error'));
    }
}

/**
 * Builds a minimal HTML page that:
 *  1. Writes the JWT token (or error) to localStorage — this is the key interaction
 *     that tells Chrome's Bounce Tracking Mitigation this is NOT a passive tracker.
 *  2. Immediately navigates to the frontend.
 *
 * This replaces silent server-side redirects which Chrome would flag.
 */
function buildTransferPage(frontendUrl, token, error) {
    const destination = token
        ? `${frontendUrl}?token=${encodeURIComponent(token)}`
        : `${frontendUrl}?error=${encodeURIComponent(error)}`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Redirecting...</title>
  <style>
    body { margin: 0; display: flex; align-items: center; justify-content: center;
           height: 100vh; background: #0d1117; font-family: sans-serif; color: #c9d1d9; }
    p { font-size: 15px; }
  </style>
</head>
<body>
  <p>Completing sign-in, please wait...</p>
  <script>
    // Actively interact with localStorage on this origin so Chrome's Bounce
    // Tracking Mitigation does not flag it as a passive intermediate tracker.
    try {
      localStorage.setItem('_auth_handoff', Date.now().toString());
      localStorage.removeItem('_auth_handoff');
    } catch (e) { /* storage blocked — continue anyway */ }

    // Navigate to the frontend with the token / error
    window.location.replace(${JSON.stringify(destination)});
  </script>
</body>
</html>`;
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