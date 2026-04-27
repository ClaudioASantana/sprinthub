const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:3000/api/tasks', {
      title: 'Teste Backlog',
      projectId: 'b567d12f-683a-4467-bc56-74ba4efb5ef6', // Any UUID works for validation test
      sprintId: null,
      type: 'task',
      priority: 'medium',
      status: 'todo'
    });
    console.log('Success:', res.data);
  } catch (err) {
    console.log('Error:', err.response?.data || err.message);
  }
}

test();
