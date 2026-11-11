const { getRepositoryIssues, getRepositoryByOwnerAndName } = require('./backend/src/services/githubService');

async function testGithubService() {
  try {
    console.log('Testing githubService functions...');

    // Test getRepositoryIssues
    console.log('Getting issues for microsoft/vscode...');
    const issues = await getRepositoryIssues('microsoft', 'vscode');
    console.log(`Received ${issues.length} issues`);

    if (issues.length > 0) {
      console.log('First issue:', issues[0].title);
    }

    // Test getRepositoryByOwnerAndName
    console.log('Getting repository details for microsoft/vscode...');
    const repository = await getRepositoryByOwnerAndName('microsoft', 'vscode');
    console.log('Repository:', repository.name);
    console.log('Language:', repository.language);
    console.log('Stars:', repository.stars);

    console.log('GitHub service test completed successfully!');

  } catch (error) {
    console.error('Error in github service test:', error);
    console.error(error.stack);
  }
}

testGithubService();