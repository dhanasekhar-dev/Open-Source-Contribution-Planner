const http = require('http');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(new Error(`Failed to parse JSON: ${e.message}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(new Error(`HTTP request error: ${e.message}`));
    });

    if (postData) {
      req.write(postData);
    }

    req.end();
  });
}

async function testControllerLogicViaAPI() {
  try {
    console.log('Testing controller logic via API calls...');

    const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWMzY2MyOWU1ZGE3ZDJkNTcyZWM1MWIiLCJpYXQiOjE3OTE2NDc4MjcsImV4cCI6MTc5MjI1MjYyN30.oudXwC8wzwqL20pHIC5hV_aG3XJyj5jVa2v-d4xVsXg';

    // Get user profile
    console.log('Getting user profile...');
    const userOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/users/profile',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    };

    const userResponse = await makeRequest(userOptions);
    if (!userResponse.success) {
      console.log('Failed to get user profile:', userResponse.message);
      return;
    }
    const user = userResponse.user;
    console.log('User found:', user.name);

    // Get issues for the repository
    console.log('Getting issues for microsoft/vscode...');
    const issuesOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/repositories/microsoft/vscode/issues',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    };

    const issuesResponse = await makeRequest(issuesOptions);
    if (!issuesResponse.success) {
      console.log('Failed to get issues:', issuesResponse.message);
      return;
    }
    const issues = issuesResponse.issues;
    console.log(`Received ${issues.length} issues`);

    if (issues.length === 0) {
      console.log('No issues found');
      return;
    }

    // Get repository details
    console.log('Getting repository details...');
    const repoOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/repositories/microsoft/vscode',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    };

    const repoResponse = await makeRequest(repoOptions);
    if (!repoResponse.success) {
      console.log('Failed to get repository:', repoResponse.message);
      return;
    }
    const repository = repoResponse.repository;
    console.log('Repository:', repository.name, 'language:', repository.language);

    // Now we need to test the filter and recommendation services directly
    // Since we can't easily call them via API, we'll require them
    const IssueFilterService = require('./backend/src/services/issueFilterService');
    const IssueRecommendationService = require('./backend/src/services/issueRecommendationService');

    // Apply filtering based on user profile and repository context
    console.log('Applying filter...');
    const filteredIssues = IssueFilterService.filterIssues(issues, user, repository);
    console.log(`Filtered to ${filteredIssues.length} issues`);

    if (filteredIssues.length === 0) {
      console.log('No issues after filtering');
      return;
    }

    // Calculate match score for each filtered issue
    console.log('Scoring issues...');
    const issuesWithScores = IssueRecommendationService.scoreIssues(filteredIssues, user, repository);
    console.log(`Scored ${issuesWithScores.length} issues`);

    // Sort by match score descending
    issuesWithScores.sort((a, b) => b.matchScore - a.matchScore);

    console.log('Top 5 scored issues:');
    for (let i = 0; i < Math.min(5, issuesWithScores.length); i++) {
      const issue = issuesWithScores[i];
      console.log(`  ${i+1}. ${issue.title} (Score: ${issue.matchScore})`);
      console.log(`     Reasons: ${issue.matchReasons.join(', ')}`);
    }

    console.log('Test completed successfully!');

  } catch (error) {
    console.error('Error in test:', error);
    console.error(error.stack);
  }
}

testControllerLogicViaAPI();