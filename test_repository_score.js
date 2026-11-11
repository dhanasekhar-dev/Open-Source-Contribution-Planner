const { calculateRepositoryMatchScore } = require('./backend/src/utils/repositoryScore');

console.log('Testing calculateRepositoryMatchScore...');

// Helper to create a mock repo object
function makeRepo(overrides = {}) {
  const defaultRepo = {
    githubId: 1,
    name: 'test-repo',
    fullName: 'user/test-repo',
    owner: 'user',
    description: 'A test repository',
    url: 'https://github.com/user/test-repo',
    language: 'Java',
    topics: ['java', 'spring'],
    stars: 1000,
    forks: 100,
    openIssues: 50,
    updatedAt: new Date().toISOString() // recent
  };
  return { ...defaultRepo, ...overrides };
}

// Helper to create a mock user object
function makeUser(overrides = {}) {
  const defaultUser = {
    languages: [],
    skills: [],
    experienceLevel: '',
    interests: []
  };
  return { ...defaultUser, ...overrides };
}

// Test 1: No preferences => score null, reasons []
console.log('\n--- Test: No preferences ---');
const userNone = makeUser();
const repo = makeRepo();
const resultNone = calculateRepositoryMatchScore(repo, userNone);
console.log(`Score: ${resultNone.score} (expected null) ${resultNone.score === null ? '✓' : '✗'}`);
console.log(`Reasons: ${JSON.stringify(resultNone.reasons)} (expected []) ${JSON.stringify(resultNone.reasons) === JSON.stringify([]) ? '✓' : '✗'}`);

// Test 2: Language match only
console.log('\n--- Test: Language match only ---');
const userLang = makeUser({ languages: ['Java'] });
const resultLang = calculateRepositoryMatchScore(repo, userLang);
// languageMatch = 100, weight 0.4 => finalScore = 100
console.log(`Score: ${resultLang.score} (expected 100) ${resultLang.score === 100 ? '✓' : '✗'}`);
console.log(`Reasons: ${JSON.stringify(resultLang.reasons)} (expected ["Java language match"]) ${JSON.stringify(resultLang.reasons) === JSON.stringify(['Java language match']) ? '✓' : '✗'}`);

// Test 3: Language mismatch only
console.log('\n--- Test: Language mismatch only ---');
const userLangMismatch = makeUser({ languages: ['Python'] });
const resultLangMismatch = calculateRepositoryMatchScore(repo, userLangMismatch);
// languageMatch = 0 => finalScore = 0
console.log(`Score: ${resultLangMismatch.score} (expected 0) ${resultLangMismatch.score === 0 ? '✓' : '✗'}`);
console.log(`Reasons: ${JSON.stringify(resultLangMismatch.reasons)} (expected []) ${JSON.stringify(resultLangMismatch.reasons) === JSON.stringify([]) ? '✓' : '✗'}`);

// Test 4: Interest match (simple case: interest matches topic)
console.log('\n--- Test: Interest match (topic) ---');
const userInterest = makeUser({ interests: ['web'] }); // interest 'web'
// repo has no 'web' topic; but we can add a topic 'web'
// Let's create a repo with topic 'web'
const repoWeb = makeRepo({ topics: ['web'] });
const resultInterest = calculateRepositoryMatchScore(repoWeb, userInterest);
// interestTopicMatch: we need to compute. Interest 'web' matches DOMAIN_PROFILES['web development']? Actually interest 'web' lower => 'web' matches profile 'web development'? The profile key is 'web development', not 'web'. The code does profile = DOMAIN_PROFILES[lowerInterest]; lowerInterest = 'web'. DOMAIN_PROFILES does not have key 'web', so profile undefined -> goes to generic fallback.
// Generic fallback: exactTopicMatch = normalizedTopics.includes(slugInterest) || normalizedTopics.includes(lowerInterest);
// slugInterest = 'web', lowerInterest='web', normalizedTopics = ['web'] => exactTopicMatch true.
// descMatch = repoDescription includes 'web'? description 'A test repository' does not include 'web' => false.
// So matchStrength = 100 (exactTopicMatch && descMatch? Actually if exactTopicMatch && descMatch => 100, else if exactTopicMatch || descMatch => 85). So we get 85.
// Let's compute: exactTopicMatch true, descMatch false => matchStrength = 85.
// totalInterestPoints = 85, divided by user.interests.length (1) => 85.
// So interestTopicMatch = 85.
// Weight 0.25 => earnedScore = 85*0.25 = 21.25, totalWeight=0.25 => finalScore = round(21.25/0.25) = round(85) = 85.
console.log(`Score: ${resultInterest.score} (expected 85) ${resultInterest.score === 85 ? '✓' : '✗'}`);
console.log(`Reasons: ${JSON.stringify(resultInterest.reasons)} (expected ["web topic match"]) ${JSON.stringify(resultInterest.reasons) === JSON.stringify(['web topic match']) ? '✓' : '✗'}`);

// Test 5: Interest match via description phrase
console.log('\n--- Test: Interest match via description phrase ---');
const userInterestDesc = makeUser({ interests: ['web development'] });
const repoDesc = makeRepo({ description: 'This is a web application framework', topics: [] });
const resultInterestDesc = calculateRepositoryMatchScore(repoDesc, userInterestDesc);
// interest 'web development' lower => matches DOMAIN_PROFILES['web development'] profile.
// dedicatedTopics list, dedicatedDescPhrases includes 'web application' etc.
// repoDescription includes 'web application' => hasDescPhrase true.
// normalizedTopics empty => hasDedicatedTopic false.
// hasStandaloneKeyword? repoName 'test-repo' does not contain 'web' as standalone? Probably false.
// Since hasDedicatedTopic false but hasDescPhrase true => matchStrength = 100 (dedicatedTopic || descPhrase).
// So interestTopicMatch = 100.
// Weight 0.25 => finalScore = 100.
console.log(`Score: ${resultInterestDesc.score} (expected 100) ${resultInterestDesc.score === 100 ? '✓' : '✗'}`);
console.log(`Reasons: ${JSON.stringify(resultInterestDesc.reasons)} (expected ["web development topic match"]) ${JSON.stringify(resultInterestDesc.reasons) === JSON.stringify(['web development topic match']) ? '✓' : '✗'}`);

// Test 6: Skill match via language
console.log('\n--- Test: Skill match via language ---');
const userSkillLang = makeUser({ skills: ['Java'] });
const resultSkillLang = calculateRepositoryMatchScore(repo, userSkillLang);
// skillTechnologyMatch: language match => 100.
// Weight 0.20 => finalScore = 100.
console.log(`Score: ${resultSkillLang.score} (expected 100) ${resultSkillLang.score === 100 ? '✓' : '✗'}`);
console.log(`Reasons: ${JSON.stringify(resultSkillLang.reasons)} (expected ["Java technology match"]) ${JSON.stringify(resultSkillLang.reasons) === JSON.stringify(['Java technology match']) ? '✓' : '✗'}`);

// Test 7: Skill match via topics
console.log('\n--- Test: Skill match via topics ---');
const userSkillTopic = makeUser({ skills: ['Spring'] });
const resultSkillTopic = calculateRepositoryMatchScore(repo, userSkillTopic);
// skill 'spring' lower => slug 'spring'
// normalizedTopics includes 'java', 'spring' => topicMatched? topic === lower? 'spring' == 'spring' true => matched.
// So skillTechnologyMatch = 100 (since matchedSkills length 1, user.skills length 1 => 100).
// Weight 0.20 => finalScore = 100.
console.log(`Score: ${resultSkillTopic.score} (expected 100) ${resultSkillTopic.score === 100 ? '✓' : '✗'}`);
console.log(`Reasons: ${JSON.stringify(resultSkillTopic.reasons)} (expected ["Spring technology match"]) ${JSON.stringify(resultSkillTopic.reasons) === JSON.stringify(['Spring technology match']) ? '✓' : '✗'}`);

// Test 8: Experience level match (simple case)
console.log('\n--- Test: Experience level match (newcomer tag) ---');
const userExp = makeUser({ experienceLevel: 'Beginner' });
const repoNewcomer = makeRepo({ topics: ['good-first-issue'] });
const resultExp = calculateRepositoryMatchScore(repoNewcomer, userExp);
// hasNewcomerTag true => suitabilityScore = 100, reason 'Newcomer-friendly contribution tags detected'
// Weight 0.15 => finalScore = 100.
console.log(`Score: ${resultExp.score} (expected 100) ${resultExp.score === 100 ? '✓' : '✗'}`);
console.log(`Reasons: ${JSON.stringify(resultExp.reasons)} (expected ["Newcomer-friendly contribution tags detected"]) ${JSON.stringify(resultExp.reasons) === JSON.stringify(['Newcomer-friendly contribution tags detected']) ? '✓' : '✗'}`);

// Test 9: Combined preferences
console.log('\n--- Test: Combined preferences (language, interest, skill, experience) ---');
const userCombo = makeUser({
  languages: ['Java'],
  interests: ['web development'],
  skills: ['Spring'],
  experienceLevel: 'Beginner'
});
const repoCombo = makeRepo({
  language: 'Java',
  topics: ['java', 'spring', 'web'],
  description: 'A web application using Spring',
  updatedAt: new Date().toISOString()
});
const resultCombo = calculateRepositoryMatchScore(repoCombo, userCombo);
// We'll compute expected roughly:
// languageMatch: 100 *0.4 = 40
// interestTopicMatch: interest 'web development' matches? topics include 'web' and description includes 'web application' => likely 100 *0.25 = 25
// skillTechnologyMatch: skill 'Spring' matches topics 'spring' => 100 *0.20 = 20
// experienceLevelSuitability: newcomer tag? topics include 'good-first-issue'? no. But we have recent update, stars etc. Let's compute suitabilityScore: level Beginner, daysSinceUpdate 0 => recent, stars 1000 => stars <=10000 and daysSinceUpdate <=90 => suitabilityScore = 85 (from code: if daysSinceUpdate <=90 && stars <=10000 => 85). Reason 'Recent repository updates detected (accessible project scale)'.
// So experienceLevelSuitability = 85 *0.15 = 12.75
// Total earnedScore = 40+25+20+12.75 = 97.75
// totalWeight = 0.4+0.25+0.2+0.15 = 1.0
// finalScore = round(97.75) = 98
// Reasons should include all four.
console.log(`Score: ${resultCombo.score} (expected ~98) ${Math.abs(resultCombo.score - 98) <= 1 ? '✓' : '✗'} (actual ${resultCombo.score})`);
console.log(`Reasons count: ${resultCombo.reasons.length} (expected 4) ${resultCombo.reasons.length === 4 ? '✓' : '✗'}`);
console.log(`Reasons: ${JSON.stringify(resultCombo.reasons)}`);

// Test 10: Edge case: score boundaries (0 and 100)
console.log('\n--- Test: Score boundaries ---');
// Already tested 100 and 0 via language match/mismatch.
// Test a case where score is something like 57.
const userMid = makeUser({ languages: ['Java'] }); // language match gives 100 weight 0.4 => 40
// Add an interest that gives low match, e.g., interest 'Data' but repo has no data topics.
// Let's add interest 'Data' and ensure no match.
const userMid2 = makeUser({ languages: ['Java'], interests: ['Data'] });
const repoMid = makeRepo({ language: 'Java', topics: ['java'], description: 'nothing about information' });
const resultMid = calculateRepositoryMatchScore(repoMid, userMid2);
// languageMatch 100 => 40
// interestTopicMatch: interest 'Data' lower => no profile, generic fallback: exactTopicMatch? topics include 'java' not 'data' => false. descMatch? description includes 'data'? false. => matchStrength 0 => interestTopicMatch 0 => contributes 0.
// totalWeight = 0.4+0.25=0.65, earnedScore = 40 => finalScore = round(40/0.65) = round(61.538) = 62.
console.log(`Score: ${resultMid.score} (expected ~62) ${Math.abs(resultMid.score - 62) <= 1 ? '✓' : '✗'} (actual ${resultMid.score})`);

console.log('\ncalculateRepositoryMatchScore tests completed.');