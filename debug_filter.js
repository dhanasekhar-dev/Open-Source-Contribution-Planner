// Debug version of matchesSkillsOrInterests to see what's happening
function debugMatchesSkillsOrInterests(issue, user) {
  console.log('\n=== DEBUG matchesSkillsOrInterests ===');

  // If no skills or interests specified, accept all
  const hasSkillsPreference = user.skills && user.skills.length > 0;
  const hasInterestsPreference = user.interests && user.interests.length > 0;

  console.log('hasSkillsPreference:', hasSkillsPreference, '(skills:', user.skills, ')');
  console.log('hasInterestsPreference:', hasInterestsPreference, '(interests:', user.interests, ')');

  if (!hasSkillsPreference && !hasInterestsPreference) {
    console.log('No skills or interests preference - returning true');
    return true;
  }

  // Create a searchable string from issue title, description, and labels
  const issueText = [
    issue.title || '',
    issue.description || '',
    ...(issue.labels || []).map(label => label.name || '')
  ].join(' ').toLowerCase();

  console.log('issueText (first 200 chars):', issueText.substring(0, 200) + '...');

  // Check skills match
  if (hasSkillsPreference) {
    console.log('\nChecking skills...');
    const skillsMatch = user.skills.some(skill => {
      const normalizedSkill = skill.trim().toLowerCase();
      const matches = issueText.includes(normalizedSkill);
      console.log('  Skill "', skill, '": normalized to "', normalizedSkill, '" ->', matches ? 'MATCH' : 'no match');
      return matches;
    });

    if (skillsMatch) {
      console.log('Skills matched - returning true');
      return true; // Skills matched, no need to check interests
    }
    console.log('No skills matched');
  }

  // Check interests match
  if (hasInterestsPreference) {
    console.log('\nChecking interests...');
    const interestsMatch = user.interests.some(interest => {
      const normalizedInterest = interest.trim().toLowerCase();
      const matches = issueText.includes(normalizedInterest);
      console.log('  Interest "', interest, '": normalized to "', normalizedInterest, '" ->', matches ? 'MATCH' : 'no match');
      return matches;
    });

    console.log('Interests match result:', interestsMatch);
    return interestsMatch;
  }

  console.log('No interests to check (but hasSkillsPreference is true) - returning false');
  return false;
}

// Test user profile from the database
const testUser = {
  languages: ["Java"],
  skills: ["Spring Boot", "REST API"],
  experienceLevel: "Intermediate",
  interests: ["Web Development", "Backend Development"],
  availableHours: "5-10 hrs/week"
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

console.log('Debugging filter service with test user profile...');
debugMatchesSkillsOrInterests(testIssue, testUser);