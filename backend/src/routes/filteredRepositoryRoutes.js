const express = require('express');
const { filteredRepositorySearchController } = require('../controllers/filteredRepositoryController');
const { optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/filtered-search', optionalAuth, filteredRepositorySearchController);

console.log('Filtered repository routes loaded');

module.exports = router;