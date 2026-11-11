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
  console.log('Testing filtered repository endpoint...');

  // Test 1: No auth, no query params (should return popular repos)
  console.log('\n1. Testing GET /api/repositories/filtered/filtered-search (no auth, no query)');
  const opts1 = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/repositories/filtered/filtered-search',
    method: 'GET',
    headers: {}
  };
  let res1;
  try {
    res1 = await makeRequest(opts1);
    if (res1.success) {
      console.log(`   ✓ Success: count=${res1.count}`);
      if (res1.repositories && res1.repositories.length > 0) {
        console.log(`   ✓ Received ${res1.repositories.length} repositories`);
        // Check first repo has expected fields
        const first = res1.repositories[0];
        console.log(`   First repo: ${first.fullName} (language: ${first.language || 'none'})`);
      }
    } else {
      console.log(`   ✗ Failed: ${res1.message}`);
    }
  } catch (err) {
    console.log(`   ✗ Error: ${err.message}`);
  }

  // Test 2: With auth token, no query params (should filter by user preferences)
  console.log('\n2. Testing GET /api/repositories/filtered/filtered-search (with auth, no query)');
  const opts2 = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/repositories/filtered/filtered-search',
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
        // Check that at least one repo matches language Java (preference)
        const javaRepo = res2.repositories.find(r => r.language && r.language.toLowerCase() === 'java');
        if (javaRepo) {
          console.log(`   ✓ Found repository with Java language: ${javaRepo.fullName}`);
        } else {
          console.log(`   ⚠ No Java-language repo found in first ${Math.min(5, res2.repositories.length)} results`);
          // Log first few languages
          const langs = res2.repositories.slice(0,5).map(r => r.language).join(', ');
          console.log(`   Languages of first 5: ${langs}`);
        }
      }
    } else {
      console.log(`   ✗ Failed: ${res2.message}`);
    }
  } catch (err) {
    console.log(`   ✗ Error: ${err.message}`);
  }

  // Test 3: With auth, query param languages=Python (should override preferences)
  console.log('\n3. Testing GET /api/repositories/filtered/filtered-search (with auth, languages=Python)');
  const opts3 = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/repositories/filtered/filtered-search?languages=Python',
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
        // Check that repos are Python language
        const allPython = res3.repositories.every(r => r.language && r.language.toLowerCase() === 'python');
        if (allPython) {
          console.log(`   ✓ All repositories are Python language`);
        } else {
          console.log(`   ⚠ Not all repositories are Python; checking first few`);
          const firstNonPy = res3.repositories.find(r => !(r.language && r.language.toLowerCase() === 'python'));
          if (firstNonPy) {
            console.log(`   Found non-Python: ${firstNonPy.fullName} language=${firstNonPy.language}`);
          }
        }
      }
    } else {
      console.log(`   ✗ Failed: ${res3.message}`);
    }
  } catch (err) {
    console.log(`   ✗ Error: ${err.message}`);
  }

  // Test 4: With auth, empty preferences via explore mode (should return popular repos)
  console.log('\n4. Testing GET /api/repositories/filtered/filtered-search (with auth, explore mode empty)');
  const opts4 = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/repositories/filtered/filtered-search?explore=true&languages=&skills=&interests=&experienceLevel=&availableHours=',
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
        // Should be similar to test 1 (popular repos)
      }
    } else {
      console.log(`   ✗ Failed: ${res4.message}`);
    }
  } catch (err) {
    console.log(`   ✗ Error: ${err.message}`);
  }

  console.log('\nFiltered repository endpoint tests completed.');
}

runTests().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});