const express = require('express')
const Cafe = require('../models/cafeModel')
const {addCafe} = require('../controllers/cafeController')


const router = express.Router()


router.post('/addshops', addCafe)

router.get("/shops", async(req, res) => {
    try {
        fakeShops = await Cafe.find()
        return res.status(200).send(fakeShops)
    } catch (err) {
        return res.status(500).json({error: err.message})
    }
})



module.exports = router