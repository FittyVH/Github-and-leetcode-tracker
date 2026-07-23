const express = require('express')
const router = express.Router()

const groupControllers = require('../controllers/group.controller')
const authMiddlewares = require('../middlewares/auth.middleware')

router.post('/create-group', authMiddlewares.authUser, groupControllers.createGroup)
router.post('/join-group/:groupId', authMiddlewares.authUser, groupControllers.joinGroup)
router.post('/leave-group/:groupId', authMiddlewares.authUser, groupControllers.leaveGroup)
router.get('/user-groups', authMiddlewares.authUser, groupControllers.getUserGroups)
router.get('/:groupId/leaderboard', authMiddlewares.authUser, groupControllers.getGroupLeaderboard);

module.exports = router