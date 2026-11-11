const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies with support for avatar data URLs
app.use((req, res, next) => {
  console.log("Request received:", req.method, req.path);
  next();
});

// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const filteredRepositoryRoutes = require('./routes/filteredRepositoryRoutes');
app.use('/api/repositories/filtered', filteredRepositoryRoutes);

const repositoryRoutes = require('./routes/repositoryRoutes');
console.log('Repository routes mounted');
app.use('/api/repositories', repositoryRoutes);

const recommendationRoutes = require('./routes/recommendationRoutes');
app.use('/api/repositories', recommendationRoutes);

// Basic route for testing
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is running smoothly' });
});

app.get('/test-direct', (req, res) => {
  res.json({msg: 'direct test'});
});

module.exports = app;
app.get('/', (req, res) => { res.json({msg: 'root path'}); });
