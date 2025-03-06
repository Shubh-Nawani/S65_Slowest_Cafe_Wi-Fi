const express = require('express');
const { getCafe, addCafe, updateCafe, deleteCafe, validateCafe, validateCafeId } = require('../controllers/cafeController');

const router = express.Router();

router.get('/cafes', getCafe);
router.post('/cafes', validateCafe, addCafe);
router.put('/cafes', [...validateCafe, ...validateCafeId], updateCafe);
router.delete('/cafes', validateCafeId, deleteCafe);

module.exports = router;
