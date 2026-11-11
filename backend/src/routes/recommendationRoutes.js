const express = require('express');
const { getRecommendedRepositories } = require('../controllers/recommendationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all recommendation routes
router.use(protect);

router.get('/recommended', getRecommendedRepositories);

module.exports = router;