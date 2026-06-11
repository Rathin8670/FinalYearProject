
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api/auth';
const EMAIL = 'bot@carepulse.com';
const PASSWORD = 'botsecurepassword123';
const NAME = 'CarePulse Bot Admin';

async function setupAuth() {
    console.log(`Checking auth for ${EMAIL}...`);

    let token = null;

    // 1. Try Login
    try {
        console.log('Attempting Login...');
        const res = await axios.post(`${BASE_URL}/signin`, { email: EMAIL, password: PASSWORD });
        if (res.data.success) {
            token = res.data.data.accessToken;
            console.log('✅ Login Successful!');
        }
    } catch (e) {
        if (e.response && e.response.status === 401) {
            console.log('⚠️ Login failed (401). User might not exist.');
            
            // 2. Try Signup
            try {
                console.log('Attempting Signup...');
                const signupRes = await axios.post(`${BASE_URL}/signup`, { 
                    email: EMAIL, 
                    password: PASSWORD, 
                    name: NAME 
                });
                
                if (signupRes.data.success) {
                    token = signupRes.data.data.accessToken;
                    console.log('✅ Signup Successful! User created.');
                }
            } catch (signupErr) {
                console.error('❌ Signup failed:', signupErr.response?.data?.message || signupErr.message);
                return;
            }
        } else {
            console.error('❌ Login error:', e.message);
            return;
        }
    }

    // 3. Update .env
    if (token) {
        const envPath = path.join(__dirname, '.env');
        let envContent = '';
        
        if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, 'utf8');
        } else {
            // fallback to example if .env doesn't exist
            if (fs.existsSync(path.join(__dirname, '.env.example'))) {
                 envContent = fs.readFileSync(path.join(__dirname, '.env.example'), 'utf8');
            }
        }

        if (envContent.includes('BACKEND_AUTH_TOKEN=')) {
            envContent = envContent.replace(/BACKEND_AUTH_TOKEN=.*/, `BACKEND_AUTH_TOKEN=${token}`);
        } else {
            envContent += `\nBACKEND_AUTH_TOKEN=${token}`;
        }

        fs.writeFileSync(envPath, envContent);
        console.log('----------------------------------------');
        console.log('✅ BACKEND_AUTH_TOKEN updated in .env');
        console.log('✅ Please restart the bot: npm run dev');
        console.log('----------------------------------------');
    }
}

setupAuth();
