const http = require('http');

const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWMzY2MyOWU1ZGE3ZDJkNTcyZWM1MWIiLCJpYXQiOjE3OTE2NDc4MjcsImV4cCI6MTc5MjI1MjYyN30.oudXwC8wzwqL20pHIC5hV_aG3XJyj5jVa2v-d4xVsXg';

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

async function runTests() {
  console.log('Testing recommended repository endpoint...');

  // Test 1: No auth token (should return 401)
  console.log('\n1. Testing GET /api/repositories/recommended (no auth)');
  const opts1 = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/repositories/recommended',
    method: 'GET',
    headers: {}
  };
  let res1;
  try {
    res1 = await makeRequest(opts1);
    // The protect middleware returns JSON with success false
    if (res1.success === false && res1.message && res1.message.includes('Not authorized')) {
      console.log(`   ✓ Correctly rejected: ${res1.message}`);
    } else {
      console.log(`   ✗ Unexpected response:`, res1);
    }
  } catch (err) {
    console.log(`   ✗ Error: ${err.message}`);
  }

  // Test 2: With auth token, no query params (should return user's recommendations)
  console.log('\n2. Testing GET /api/repositories/recommended (with auth, no query)');
  const opts2 = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/repositories/recommended',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  };
  let res2;
  try {
    res2 = await makeRequest(opts2);
    if (res2.success) {
      console.log(`   ✓ Success: count=${res2.count}`);
      if (res2.repositories && res2.repositories.length > 0) {
        console.log(`   ✓ Received ${res2.repositories.length} repositories`);
        // Check first few have matchScore and matchReasons
        const first = res2.repositories[0];
        if (first.matchScore !== undefined && first.matchReasons !== undefined) {
          console.log(`   ✓ First repo has matchScore=${first.matchScore} and matchReasons: ${first.matchReasons.join(', ')}`);
          // Ensure matchScore is number between 0 and 100 or null
          if (first.matchScore === null || (typeof first.matchScore === 'number' && first.matchScore >= 0 && first.matchScore <= 100)) {
            console.log(`   ✓ matchScore is valid`);
          } else {
            console.log(`   ✗ Invalid matchScore: ${first.matchScore}`);
          }
        } else {
          console.log(`   ✗ Missing matchScore or matchReasons`);
        }
        // Check sorting descending by matchScore (null scores at end)
        let prevScore = 101;
        let sortedDesc = true;
        for (const repo of res2.repositories) {
          const score = repo.matchScore === null ? -1 : repo.matchScore;
          if (score > prevScore) {
            sortedDesc = false;
            break;
          }
          prevScore = score;
        }
        if (sortedDesc) {
          console.log(`   ✓ Repositories sorted descending by matchScore`);
        } else {
          console.log(`   ✗ Repositories not sorted correctly`);
        }
      } else {
        console.log(`   ⚠ No repositories returned`);
      }
    } else {
      console.log(`   ✗ Failed: ${res2.message}`);
    }
  } catch (err) {
    console.log(`   ✗ Error: ${err.message}`);
  }

  // Test 3: With auth, query param languages=Python (should override preferences)
  console.log('\n3. Testing GET /api/repositories/recommended (with auth, languages=Python)');
  const opts3 = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/repositories/recommended?languages=Python',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  };
  let res3;
  try {
    res3 = await makeRequest(opts3);
    if (res3.success) {
      console.log(`   ✓ Success: count=${res3.count}`);
      if (res3.repositories && res3.repositories.length > 0) {
        console.log(`   ✓ Received ${res3.repositories.length} repositories`);
        // Check that repos have Python language (since we forced language preference)
        const pythonRepo = res3.repositories.find(r => r.language && r.language.toLowerCase() === 'python');
        if (pythonRepo) {
          console.log(`   ✓ Found repository with Python language: ${pythonRepo.fullName}`);
        } else {
          console.log(`   ⚠ No Python-language repo found`);
        }
      }
    } else {
      console.log(`   ✗ Failed: ${res3.message}`);
    }
  } catch (err) {
    console.log(`   ✗ Error: ${err.message}`);
  }

  // Test 4: With auth, explore mode empty preferences (should return score null for all)
  console.log('\n4. Testing GET /api/repositories/recommended (with auth, explore mode empty)');
  const opts4 = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/repositories/recommended?explore=true&languages=&skills=&interests=&experienceLevel=&availableHours=',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  };
  let res4;
  try {
    res4 = await makeRequest(opts4);
    if (res4.success) {
      console.log(`   ✓ Success: count=${res4.count}`);
      if (res4.repositories && res4.repositories.length > 0) {
        console.log(`   ✓ Received ${res4.repositories.length} repositories`);
        // Check that matchScore is null for all (since no preferences)
        const allNull = res4.repositories.every(r => r.matchScore === null);
        if (allNull) {
          console.log(`   ✓ All repositories have matchScore null (no preferences)`);
        } else {
          console.log(`   ⚠ Some repositories have non-null matchScore`);
          const nonNull = res4.repositories.find(r => r.matchScore !== null);
          if (nonNull) {
            console.log(`   Example: ${nonNull.fullName} score=${nonNull.matchScore}`);
          }
        }
        // matchReasons should be empty array
        const allEmptyReasons = res4.repositories.every(r => Array.isArray(r.matchReasons) && r.matchReasons.length === 0);
        if (allEmptyReasons) {
          console.log(`   ✓ All repositories have empty matchReasons`);
        } else {
          console.log(`   ⚠ Some repositories have non-empty matchReasons`);
        }
      }
    } else {
      console.log(`   ✗ Failed: ${res4.message}`);
    }
  } catch (err) {
    console.log(`   ✗ Error: ${err.message}`);
  }

  console.log('\nRecommended repository endpoint tests completed.');
}

runTests().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});