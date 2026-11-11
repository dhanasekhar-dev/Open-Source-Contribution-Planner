const User = require('./backend/src/models/User');
const { getRepositoryIssues, getRepositoryByOwnerAndName } = require('./backend/src/services/githubService');
const IssueFilterService = require('./backend/src/services/issueFilterService');
const IssueRecommendationService = require('./backend/src/services/issueRecommendationService');

async function testControllerLogic() {
  try {
    console.log('Testing controller logic for recommended issues...');

    // Get user from database (using the test user we know exists)
    const userId = "6ac3cc29e5da7d2d572ec51b"; // From our earlier login
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found');
      return;
    }
    console.log('User found:', user.name);

    // Fetch issues for the repository
    const owner = 'microsoft';
    const repo = 'vscode';
    console.log('Fetching issues for', owner, '/', repo);
    const issues = await getRepositoryIssues(owner, repo);
    console.log(`Received ${issues.length} issues`);

    if (issues.length === 0) {
      console.log('No issues found');
      return;
    }

    // Fetch the repository details
    console.log('Fetching repository details...');
    const repository = await getRepositoryByOwnerAndName(owner, repo);
    console.log('Repository:', repository.name, 'language:', repository.language);

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

testControllerLogic();