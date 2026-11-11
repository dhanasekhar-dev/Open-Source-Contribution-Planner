const express = require('express');
const { searchRepositoriesController, getRepositoryController, getRepositoryIssuesController, getRecommendedIssuesController } = require('../controllers/repositoryController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();
router.get('/top', (req, res) => { res.json({msg: 'top route'}); });

router.get('/test', (req, res) => { console.log('Test route called'); console.log(''); res.json({msg: 'test route'}); });
router.get('/test2', (req, res) => { res.json({msg: 'test2 route'}); });

// Public repository search and browsing routes
router.get('/search', optionalAuth, searchRepositoriesController);
router.get('/:owner/:repo', optionalAuth, getRepositoryController);
router.get("/:owner/:repo/issues", optionalAuth, getRepositoryIssuesController);

// Recommended issues route genuinely requires an authenticated user profile
router.get("/:owner/:repo/issues/recommended", protect, getRecommendedIssuesController);

module.exports = router;
