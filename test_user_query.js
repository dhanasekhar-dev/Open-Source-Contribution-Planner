const User = require('./backend/src/models/User');
const mongoose = require('./backend/node_modules/mongoose');
const connectDB = require('./backend/src/config/db');
const dotenv = require('./backend/node_modules/dotenv');
const path = require('path');

async function testUserQuery() {
  try {
    dotenv.config({ path: path.resolve(__dirname, 'backend', '.env') });
    await connectDB();
    console.log('Testing user query from database...');

    // Use the same user ID we know exists
    const userId = "6ac3cc29e5da7d2d572ec51b";
    console.log('Querying for user ID:', userId);

    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found');
      return;
    }

    console.log('User found:', user.name);
    console.log('User email:', user.email);
    console.log('User skills:', user.skills);
    console.log('User interests:', user.interests);

    console.log('User query test completed successfully!');

  } catch (error) {
    console.error('Error in user query test:', error);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
  }
}

testUserQuery();