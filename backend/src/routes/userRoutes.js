const express = require('express');
const { getProfile, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all user routes
router.use(protect);

router.route('/profile')
  .get(getProfile)
  .put(updateProfile);

module.exports = router;