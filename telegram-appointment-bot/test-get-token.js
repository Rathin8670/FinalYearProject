
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// --- CONFIG ---
const API_URL = 'http://localhost:5000/api/auth/signin';
const EMAIL = 'patient@example.com'; // Default test user
const PASSWORD = 'password123';      // Default test password

async function getToken() {
  console.log(`Attempting to login as ${EMAIL}...`);
  try {
    const response = await axios.post(API_URL, {
      email: EMAIL,
      password: PASSWORD
    });

    if (response.data.success) {
      const token = response.data.data.accessToken;
      console.log('\n✅ Login Successful!');
      console.log('----------------------------------------');
      console.log('YOUR TOKEN (Copy this to .env):');
      console.log(token);
      console.log('----------------------------------------');
      
      // Optional: Try to auto-update .env
      const envPath = path.join(__dirname, '.env');
      if (fs.existsSync(envPath)) {
          let envContent = fs.readFileSync(envPath, 'utf8');
          if (envContent.includes('BACKEND_AUTH_TOKEN=')) {
              envContent = envContent.replace(/BACKEND_AUTH_TOKEN=.*/, `BACKEND_AUTH_TOKEN=${token}`);
              fs.writeFileSync(envPath, envContent);
              console.log('✅ Automatically updated BACKEND_AUTH_TOKEN in .env');
          } else {
              console.log('⚠️ Could not auto-update .env (key not found)');
          }
      }
    } else {
      console.error('Login failed:', response.data.message);
    }
  } catch (error) {
    if (error.response) {
      console.error('Login error:', error.response.status, error.response.data);
      if (error.response.status === 401) {
          console.log('\n❌ Suggestion: The default user might not exist or password is wrong.');
          console.log('Try creating a user via the UI first, or check credentials.');
      }
    } else {
      console.error('Network error:', error.message);
    }
  }
}

getToken();
