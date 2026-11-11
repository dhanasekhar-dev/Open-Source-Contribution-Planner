const IssueFilterService = require('./src/services/issueFilterService');

// Mock user with intermediate experience, but empty skills and interests to isolate experience filter
const user = {
  languages: [], // We don't care about language for this test
  skills: [],    // No skills preference
  experienceLevel: "Intermediate",
  interests: [], // No interests preference
  availableHours: "" // No time preference
};

// Mock repository for microsoft/vscode
const repository = {
  language: "TypeScript",
  stars: 100000,
  forks: 20000,
  openIssues: 10000,
  updatedAt: new Date().toISOString() // recent
};

// Mock issue (minimal)
const issue = {
  title: "Test issue",
  description: "Test description",
  labels: []
};

console.log('Testing filters with user having no skills/interests preference:');
console.log('matchesLanguage:', IssueFilterService.matchesLanguage(issue, user, repository));
console.log('matchesSkillsOrInterests:', IssueFilterService.matchesSkillsOrInterests(issue, user));
console.log('matchesExperienceLevel:', IssueFilterService.matchesExperienceLevel(issue, user, repository));
console.log('matchesAvailableTime:', IssueFilterService.matchesAvailableTime(issue, user, repository));

const filtered = IssueFilterService.filterIssues([issue], user, repository);
console.log('Number of issues after filtering:', filtered.length);
if (filtered.length > 0) {
  console.log('SUCCESS: Experience level fix allows issue to pass when skills/interests are empty.');
} else {
  console.log('FAILURE: Issue still filtered out.');
}
