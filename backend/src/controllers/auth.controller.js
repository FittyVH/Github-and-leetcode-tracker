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

module.exports = { redirectToGitHub, githubCallback }