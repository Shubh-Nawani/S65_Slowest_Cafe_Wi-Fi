const express = require('express')
const { signup, signin } = require('../controllers/userController')
const Dashboard = require('../controllers/dashbardController')
const Delete = require('../controllers/deleteUserController')

const router = express.Router()

router.post("/signup", signup)
router.post("/signin", signin)
router.get("/dashboard", Dashboard)
router.delete("/user", Delete)

module.exports = router