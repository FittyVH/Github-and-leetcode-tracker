const groupModel = require('../models/group.model')

async function createGroup(req, res) {
    const { name, description } = req.body

    if (!name) {
        return res.status(400).json({ message: "Group name is required" });
    }

    try {
        const newGroup = await groupModel.create({
            name: name,
            creator: req.user.id,
            members: [req.user.id]
        })

        res.status(201).json({
            message: "Group created successfully!",
            group: newGroup
        });

    } catch (err) {
        console.error("Create group error:", err);
        res.status(500).json({ message: "Server error creating group" });
    }
}

async function joinGroup(req, res) {
    try {
        const { groupId } = req.params; // get id from the api
        const userId = req.user.id;

        const group = await groupModel.findById(groupId)

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // if user already in group
        if (group.members.includes(userId)) {
            return res.status(400).json({ message: "You are already a member of this group!" });
        }

        // add user
        group.members.push(userId)
        await group.save() // we need to do this because we tweaked the values of the schema

        res.status(200).json({
            message: "Successfully joined the group!",
            group
        });
    }
    catch (err) {
        console.error("Join group error:", err);

        // Catch invalid MongoDB ObjectIDs
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ message: "Invalid Group ID format" });
        }
        res.status(500).json({ message: "Server error joining group" });
    }
}

async function getRecentCommits(username) {
    try {
        const response = await fetch(`https://api.github.com/users/${username}/events`, {
            method: "GET",
            // global headers
            headers: {
                Accept: "application/json",
                "User-Agent": "Github-Leetcode-Tracker"
            }
        });

        if (!response.ok) return 0; // Return 0 if user profile is private or error occurs

        const events = await response.json();

        let totalCommits = 0;

        // Loop through their recent GitHub activity stream
        events.forEach(event => {
            // Check if the activity was a code push
            if (event.type === "PushEvent" && event.payload) {
                totalCommits += 1;
            }
        });

        return totalCommits;
    } catch (err) {
        console.error(`Error fetching stats for ${username}:`, err);
        return 0;
    }
}

module.exports = { createGroup, joinGroup }