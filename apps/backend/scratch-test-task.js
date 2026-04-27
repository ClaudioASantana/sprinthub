const axios = require('axios');
async function test() {
  try {
    const res = await axios.post('http://localhost:3000/api/tasks', {
      title: 'Teste Backlog',
      projectId: 'some-id',
      sprintId: null
    });
    console.log(res.data);
  } catch (err) {
    console.log(err.response?.data || err.message);
  }
}
test();
