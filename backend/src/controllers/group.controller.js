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

async function getRecentGitHubCommits(username) {
    try {
        const response = await fetch(`https://api.github.com/users/${username}/events`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "User-Agent": "Github-Leetcode-Tracker"
            }
        });

        if (!response.ok) return { totalCommits: 0, commits24h: 0 };

        const events = await response.json();
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);

        let totalCommits = 0;
        let commits24h = 0;

        events.forEach(event => {
            if (event.type === "PushEvent" && event.payload) {
                const commitCount = (event.payload.commits && event.payload.commits.length) || 1;
                totalCommits += commitCount;

                const eventTime = new Date(event.created_at).getTime();
                if (eventTime >= oneDayAgo) {
                    commits24h += commitCount;
                }
            }
        });

        return { totalCommits, commits24h };
    } catch (err) {
        console.error(`Error fetching GitHub stats for ${username}:`, err);
        return { totalCommits: 0, commits24h: 0 };
    }
}

async function getLeetCodeDetails(username) {
    try {
        const url = "https://leetcode.com/graphql";
        
        const query = `
          query getUserLeetCodeDetails($username: String!) {
            matchedUser(username: $username) {
              submitStats {
                acSubmissionNum {
                  difficulty
                  count
                }
              }
            }
            recentAcSubmissionList(username: $username, limit: 20) {
              id
              title
              titleSlug
              timestamp
            }
          }
        `;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query,
                variables: { username }
            })
        });

        if (!response.ok) {
            return { totalSolved: 0, solved24hCount: 0, solved24hQuestions: [] };
        }

        const result = await response.json();
        
        const submissionStats = result.data?.matchedUser?.submitStats?.acSubmissionNum;
        let totalSolved = 0;
        if (submissionStats) {
            const totalSolvedObj = submissionStats.find(stat => stat.difficulty === "All");
            if (totalSolvedObj) totalSolved = totalSolvedObj.count;
        }

        const recentSubmissions = result.data?.recentAcSubmissionList || [];
        const oneDayAgoSec = Math.floor((Date.now() - (24 * 60 * 60 * 1000)) / 1000);

        const recent24hSubmissions = recentSubmissions.filter(sub => {
            const subTimestamp = parseInt(sub.timestamp, 10);
            return subTimestamp >= oneDayAgoSec;
        });

        const uniqueTitlesSet = new Set();
        const solved24hQuestions = [];

        recent24hSubmissions.forEach(sub => {
            if (!uniqueTitlesSet.has(sub.titleSlug)) {
                uniqueTitlesSet.add(sub.titleSlug);
                solved24hQuestions.push({
                    title: sub.title,
                    titleSlug: sub.titleSlug,
                    url: `https://leetcode.com/problems/${sub.titleSlug}/`,
                    timestamp: sub.timestamp
                });
            }
        });

        return {
            totalSolved,
            solved24hCount: solved24hQuestions.length,
            solved24hQuestions
        };

    } catch (err) {
        console.error(`Error fetching LeetCode details for ${username}:`, err);
        return { totalSolved: 0, solved24hCount: 0, solved24hQuestions: [] };
    }
}

async function getGroupLeaderboard(req, res) {
    try {
        const { groupId } = req.params;

        const group = await groupModel.findById(groupId).populate('members');

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        const leaderboardPromises = group.members.map(async (member) => {
            const githubUsername = member.username;
            const leetcodeUsername = member.leetcodeUsername || member.username;

            const [githubStats, leetcodeStats] = await Promise.all([
                getRecentGitHubCommits(githubUsername),
                getLeetCodeDetails(leetcodeUsername)
            ]);

            return {
                id: member._id,
                username: member.username,
                leetcodeUsername: member.leetcodeUsername,
                avatarUrl: member.avatarUrl,

                // 24h daily stats
                github24hCommits: githubStats.commits24h,
                leetcode24hSolved: leetcodeStats.solved24hCount,
                leetcode24hQuestions: leetcodeStats.solved24hQuestions,
                dailyScore: githubStats.commits24h + leetcodeStats.solved24hCount,

                // Overall / all-time stats
                githubTotalCommits: githubStats.totalCommits,
                leetcodeTotalSolved: leetcodeStats.totalSolved,
                totalScore: githubStats.totalCommits + leetcodeStats.totalSolved
            };
        });

        const membersData = await Promise.all(leaderboardPromises);

        // Daily 24h leaderboard sorted by dailyScore descending
        const leaderboardDaily = [...membersData].sort((a, b) => b.dailyScore - a.dailyScore);

        // Overall leaderboard sorted by totalScore descending
        const leaderboardOverall = [...membersData].sort((a, b) => b.totalScore - a.totalScore);

        res.status(200).json({
            groupId: group._id,
            groupName: group.name,
            creator: group.creator,
            membersCount: group.members.length,
            leaderboardDaily,
            leaderboardOverall,
            leaderboard: leaderboardDaily // default to daily leaderboard
        });

    } catch (err) {
        console.error("Leaderboard error:", err);
        res.status(500).json({ message: "Server error generating leaderboard" });
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

async function leaveGroup(req, res) {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;

        const group = await groupModel.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        const isMember = group.members.some(m => m.toString() === userId.toString());
        if (!isMember) {
            return res.status(400).json({ message: "You are not a member of this group!" });
        }

        group.members = group.members.filter(m => m.toString() !== userId.toString());

        if (group.members.length === 0) {
            await groupModel.findByIdAndDelete(groupId);
            return res.status(200).json({ message: "Successfully left the group!" });
        }

        if (group.creator && group.creator.toString() === userId.toString()) {
            group.creator = group.members[0];
        }

        await group.save();

        res.status(200).json({
            message: "Successfully left the group!",
            group
        });
    } catch (err) {
        console.error("Leave group error:", err);

        if (err.kind === 'ObjectId') {
            return res.status(400).json({ message: "Invalid Group ID format" });
        }
        res.status(500).json({ message: "Server error leaving group" });
    }
}

module.exports = { createGroup, joinGroup, leaveGroup, getGroupLeaderboard, getUserGroups }