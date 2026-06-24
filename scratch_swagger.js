const https = require('https');

https.get('https://leoned.vercel.app/api-docs/json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const d = JSON.parse(data);
    const ok = d.paths['/api/dashboard/teacher'].get.responses['200'];
    console.log(JSON.stringify(ok, null, 2));
  });
});
