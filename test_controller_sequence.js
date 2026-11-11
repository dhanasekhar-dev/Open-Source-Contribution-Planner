const IssueFilterService = require('./backend/src/services/issueFilterService');
const IssueRecommendationService = require('./backend/src/services/issueRecommendationService');
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

async function testControllerSequence() {
  try {
    console.log('Step 1: Fetching issues from API...');
    const issues = await getIssuesFromAPI();
    console.log(`✓ Received ${issues.length} issues`);

    console.log('Step 2: Fetching repository from API...');
    const repository = await getRepositoryFromAPI();
    console.log('✓ Repository loaded');

    // Simulate the user from the token (we know this works from the user profile endpoint)
    const user = {
      _id: "6ac3cc29e5da7d2d572ec51b",
      languages: ["Java"],
      skills: ["Spring Boot", "REST API"],
      experienceLevel: "Intermediate",
      interests: ["Web Development", "Backend Development"],
      availableHours: "5-10 hrs/week"
    };
    console.log('✓ User object created');

    console.log('Step 3: Testing IssueFilterService.filterIssues...');
    const filteredIssues = IssueFilterService.filterIssues(issues, user, repository);
    console.log(`✓ Filtered down to ${filteredIssues.length} issues`);

    if (filteredIssues.length === 0) {
      console.log('Would return early with message: No issues matched your current preferences after filtering. Consider broadening your preferences.');
      return;
    }

    console.log('Step 4: Testing IssueRecommendationService.scoreIssues...');
    const issuesWithScores = IssueRecommendationService.scoreIssues(filteredIssues, user, repository);
    console.log(`✓ Scored ${issuesWithScores.length} issues`);

    // Sort by match score descending
    issuesWithScores.sort((a, b) => b.matchScore - a.matchScore);

    console.log('Step 5: Top 5 scored issues:');
    for (let i = 0; i < Math.min(5, issuesWithScores.length); i++) {
      const issue = issuesWithScores[i];
      console.log(`  ${i+1}. ${issue.title.substring(0, 50)}... (Score: ${issue.matchScore})`);
      console.log(`     Reasons: ${issue.matchReasons.join(', ')}`);
    }

    console.log('\n✅ All steps completed successfully!');
  } catch (error) {
    console.error('❌ Error in test:', error);
    console.error(error.stack);
  }
}

testControllerSequence();