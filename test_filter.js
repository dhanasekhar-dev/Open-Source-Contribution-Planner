const IssueFilterService = require('./backend/src/services/issueFilterService');

// Test user profile from the database
const testUser = {
  languages: ["Java"],
  skills: ["Spring Boot", "REST API"],
  experienceLevel: "Intermediate",
  interests: ["Web Development", "Backend Development"],
  availableHours: "5-10 hrs/week"
};

// Mock repository data for microsoft/vscode
const testRepository = {
  name: "vscode",
  owner: "microsoft",
  language: "TypeScript",
  stars: 130000, // approximate
  forks: 20000,  // approximate
  openIssues: 5000, // approximate
  updatedAt: "2026-10-10T15:00:11Z" // from the issue we saw
};

// Test issue data from the first issue we saw
const testIssue = {
  githubId: 5792302512,
  number: 340865,
  title: "Copilot session goal always selects Copilot",
  description: "<!-- Please search existing issues to avoid creating duplicates -->\n<!-- Please attach logs to help us diagnose your issue -->\n\n- Copilot Chat Extension Version: @github/copilot 1.0.92-4.unstable.r37397886721.gad270aa\n- VS Code Version: 1.141.0 (system setup)\n- OS Version: Windows_NT x64 10.0.26100\n- Feature (e.g. agent/edit/ask mode): Chat\n- Selected model (e.g. GPT 4.1, Claude 3.7 Sonnet):\n- Logs:\n\nSteps to Reproduce:\n\n1. Open a new window/session\n2. Observe that the session goal does not follow the previous selection — it always defaults to selecting \"Copilot\"\n3. User preference is to use \"local\" instead\n\nExpected behavior: The session goal selection should persist across new windows/sessions, or at least respect the user's last choice.\n\nActual behavior: Every new window resets the session goal to \"Copilot\" regardless of the previous selection.",
  url: "https://github.com/microsoft/vscode/issues/340865",
  state: "open",
  createdAt: "2026-10-10T14:50:44Z",
  updatedAt: "2026-10-10T15:00:11Z",
  labels: [
    { id: 12580738481, name: "new release", color: "006b75", default: false, description: "Issues found in a recent release of VS Code", archived_at: null, archived_by: null }
  ],
  assignee: "meganrogge"
};

console.log('Testing filter service with test user profile...');
console.log('User:', JSON.stringify(testUser, null, 2));
console.log('Repository:', JSON.stringify(testRepository, null, 2));
console.log('Issue:', JSON.stringify(testIssue, null, 2));

console.log('\n--- Testing matchesLanguage ---');
const langMatch = IssueFilterService.matchesLanguage(testIssue, testUser, testRepository);
console.log('matchesLanguage:', langMatch);

console.log('\n--- Testing matchesSkillsOrInterests ---');
const skillsMatch = IssueFilterService.matchesSkillsOrInterests(testIssue, testUser);
console.log('matchesSkillsOrInterests:', skillsMatch);

console.log('\n--- Testing matchesExperienceLevel ---');
const expMatch = IssueFilterService.matchesExperienceLevel(testIssue, testUser, testRepository);
console.log('matchesExperienceLevel:', expMatch);

console.log('\n--- Testing matchesAvailableTime ---');
const timeMatch = IssueFilterService.matchesAvailableTime(testIssue, testUser, testRepository);
console.log('matchesAvailableTime:', timeMatch);

console.log('\n--- Overall filter result ---');
const overallMatch = langMatch && skillsMatch && expMatch && timeMatch;
console.log('Overall match (should be true for issue to pass filter):', overallMatch);

if (!overallMatch) {
  console.log('\n--- Why the issue is being filtered out ---');
  if (!langMatch) console.log('- Failed language match');
  if (!skillsMatch) console.log('- Failed skills/interests match');
  if (!expMatch) console.log('- Failed experience level match');
  if (!timeMatch) console.log('- Failed available time match');
}