const express = require('express')
const router = express.Router()

const groupControllers = require('../controllers/group.controller')
const authMiddlewares = require('../middlewares/auth.middleware')

router.post('/create-group', authMiddlewares.authUser, groupControllers.createGroup)
router.post('/join-group/:groupId', authMiddlewares.authUser, groupControllers.joinGroup)

module.exports = router