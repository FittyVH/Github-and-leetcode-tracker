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

async function getGroupLeaderboard(req, res) {
    try {
        const { groupId } = req.params;

        // 1. Fetch group and POPULATE the members array to get member details
        const group = await groupModel.findById(groupId).populate('members');

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // 2. Map through all members and fetch live GitHub and LeetCode stats concurrently
        const leaderboardPromises = group.members.map(async (member) => {
            const githubUsername = member.username;
            const leetcodeUsername = member.leetcodeUsername || member.username;

            const [commits, leetcodeSolved] = await Promise.all([
                getRecentCommits(githubUsername),
                getLeetCodeStats(leetcodeUsername)
            ]);

            return {
                id: member._id,
                username: member.username,
                leetcodeUsername: member.leetcodeUsername,
                avatarUrl: member.avatarUrl,
                commitScore: commits,
                leetcodeScore: leetcodeSolved,
                totalScore: commits + leetcodeSolved
            };
        });

        const leaderboardData = await Promise.all(leaderboardPromises);

        // 3. Sort by total activity score (GitHub commits + LeetCode solved) descending
        leaderboardData.sort((a, b) => b.totalScore - a.totalScore);

        res.status(200).json({
            groupId: group._id,
            groupName: group.name,
            creator: group.creator,
            membersCount: group.members.length,
            leaderboard: leaderboardData
        });

    } catch (err) {
        console.error("Leaderboard error:", err);
        res.status(500).json({ message: "Server error generating leaderboard" });
    }
}

async function getLeetCodeStats(username) {
    try {
        // leetcode graphql gateway
        const url = "https://leetcode.com/graphql";
        
        // graphql query to get number of submissions of all difficulty problems
        const query = `
          query userProblemsSolved($username: String!) {
            matchedUser(username: $username) {
              submitStats {
                acSubmissionNum {
                  difficulty
                  count
                }
              }
            }
          }
        `;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query: query,
                variables: { username: username }
            })
        });

        if (!response.ok) return 0;

        const result = await response.json();
        
        // get acSubmissionNum
        const submissionStats = result.data?.matchedUser?.submitStats?.acSubmissionNum;
        
        if (!submissionStats) return 0;

        // Find the "All" difficulty slot which holds the total number of unique solved problems
        const totalSolvedObj = submissionStats.find(stat => stat.difficulty === "All");
        
        return totalSolvedObj ? totalSolvedObj.count : 0;

    } catch (err) {
        console.error(`Error fetching LeetCode stats for ${username}:`, err);
        return 0;
    }
}

async function getUserGroups(req, res) {
    try {
        const userId = req.user.id;
        const groups = await groupModel.find({ members: userId })
            .populate('members', 'username avatarUrl')
            .populate('creator', 'username avatarUrl');

        res.status(200).json({
            message: "User groups retrieved successfully",
            groups
        });
    } catch (err) {
        console.error("Get user groups error:", err);
        res.status(500).json({ message: "Server error fetching user groups" });
    }
}

module.exports = { createGroup, joinGroup, getGroupLeaderboard, getUserGroups }