const express = require('express');
const Cafe = require('../models/cafeModel');
const {getCafe, addCafe, updateCafe, deleteCafe} = require('../controllers/cafeController');

const router = express.Router();

router.get('/cafe', getCafe);
router.post('/cafe', addCafe);
router.put('/cafe', updateCafe);
router.delete('/cafe', deleteCafe)

module.exports = router;