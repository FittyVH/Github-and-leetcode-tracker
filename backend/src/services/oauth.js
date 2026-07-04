const { Github } = require('artic')

const github = new GitHub(
    process.env.GITHUB_CLIENT_ID,
    process.env.GITHUB_CLIENT_SECRET,
    "http://localhost:3000/github/callback"
);

module.exports = github