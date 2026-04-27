const axios = require('axios');

async function run() {
  try {
    const authRes = await axios.post('http://localhost:3000/api/auth/dev-login', {
      email: 'admin@sprinthub.com',
      role: 'super_admin'
    });
    const token = authRes.data.access_token;

    const res = await axios.get('http://localhost:3000/api/companies', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Companies:', res.data);
  } catch (err) {
    if (err.response) {
      console.error('API Error:', err.response.data);
    } else {
      console.error('Error:', err.message);
    }
  }
}

run();
