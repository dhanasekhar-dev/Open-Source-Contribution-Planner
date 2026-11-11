const IssueRecommendationService = require('./backend/src/services/issueRecommendationService');
const User = require('./backend/src/models/User');

// Test user profile from the database
const testUser = {
  _id: "6ac3cc29e5da7d2d572ec51b",
  languages: ["Java"],
  skills: ["Spring Boot", "REST API"],
  experienceLevel: "Intermediate",
  interests: ["Web Development", "Backend Development"],
  availableHours: "5-10 hrs/week"
};

// We'll need to mock the GitHub service calls since we can't easily make real calls
// Instead, let's use the actual data from our previous API call

// Let's get a few issues from the API to test with
const http = require('http');

function getIssuesFromAPI() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/repositories/microsoft/vscode/issues',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWMzY2MyOWU1ZGE3ZDJkNTcyZWM1MWIiLCJpYXQiOjE3OTE2NDc4MjcsImV4cCI6MTc5MjI1MjYyN30.oudXwC8wzwqL20pHIC5hV_aG3XJyj5jVa2v-d4xVsXg'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.success) {
            resolve(parsed.issues);
          } else {
            reject(new Error(`API error: ${parsed.message}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse JSON: ${e.message}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(new Error(`HTTP request error: ${e.message}`));
    });

    req.end();
  });
}

// Let's also get the repository data
function getRepositoryFromAPI() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/repositories/microsoft/vscode',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWMzY2MyOWU1ZGE3ZDJkNTcyZWM1MWIiLCJpYXQiOjE3OTE2NDc4MjcsImV4cCI6MTc5MjI1MjYyN30.oudXwC8wzwqL20pHIC5hV_aG3XJyj5jVa2v-d4xVsXg'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.success) {
            resolve(parsed.repository);
          } else {
            reject(new Error(`API error: ${parsed.message}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse JSON: ${e.message}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(new Error(`HTTP request error: ${e.message}`));
    });

    req.end();
  });
}

async function testRecommendationService() {
  try {
    console.log('Fetching issues from API...');
    const issues = await getIssuesFromAPI();
    console.log(`Received ${issues.length} issues`);

    console.log('Fetching repository from API...');
    const repository = await getRepositoryFromAPI();
    console.log('Repository:', repository);

    console.log('Calling IssueRecommendationService.scoreIssues...');
    const issuesWithScores = IssueRecommendationService.scoreIssues(issues, testUser, repository);
    console.log(`Scored ${issuesWithScores.length} issues`);

    // Sort by match score descending
    issuesWithScores.sort((a, b) => b.matchScore - a.matchScore);

    console.log('Top 5 scored issues:');
    for (let i = 0; i < Math.min(5, issuesWithScores.length); i++) {
      const issue = issuesWithScores[i];
      console.log(`  ${i+1}. ${issue.title} (Score: ${issue.matchScore})`);
      console.log(`     Reasons: ${issue.matchReasons.join(', ')}`);
    }

  } catch (error) {
    console.error('Error in test:', error);
    console.error(error.stack);
  }
}

testRecommendationService();