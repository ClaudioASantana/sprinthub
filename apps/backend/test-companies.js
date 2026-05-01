const axios = require('axios');

async function run() {
  try {
    // 1. Get dev token
    const authRes = await axios.post('http://localhost:3000/api/auth/dev-login', {
      email: 'admin@sprinthub.com',
      role: 'super_admin'
    });
    const token = authRes.data.access_token;

    console.log('Token obtained');

    // 2. Create company
    const createRes = await axios.post('http://localhost:3000/api/companies', {
      name: 'Test Tenant',
      cnpj: '99999999000199',
      responsible: 'Test Owner',
      email: 'test@tenant.com',
      ownerEmail: 'test@tenant.com',
      ownerName: 'Test Owner'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Success:', createRes.data);
  } catch (err) {
    if (err.response) {
      console.error('API Error:', err.response.data);
    } else {
      console.error('Error:', err.message);
    }
  }
}

run();
