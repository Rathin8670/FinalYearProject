
const axios = require('axios');

async function checkDoctors() {
  try {
    const res = await axios.get('http://localhost:5000/api/doctors');
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error(err.message);
  }
}

checkDoctors();
