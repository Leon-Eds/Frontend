const fs = require('fs');
const https = require('https');

https.get('https://leoned.vercel.app/api-docs/json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const swagger = JSON.parse(data);
    const apiFile = fs.readFileSync('src/lib/api.ts', 'utf8');
    
    const newEndpoints = [];
    
    for (const [path, methods] of Object.entries(swagger.paths)) {
      // Create a simplified version of the path to search for in api.ts
      // E.g. /api/teacher/{id} -> /teacher/
      const searchPath = path.replace('/api', '').split('{')[0].replace(/\/$/, '');
      
      let found = false;
      if (searchPath && searchPath !== '') {
        if (apiFile.includes(searchPath)) {
          found = true;
        }
      }
      
      if (!found) {
        newEndpoints.push({ path, methods });
      }
    }
    
    // Also, just print ALL paths to see what's there
    fs.writeFileSync('all_paths.json', JSON.stringify(Object.keys(swagger.paths), null, 2));
    
    // Let's print out the paths that were not clearly found in api.ts
    const output = newEndpoints.map(e => {
      let info = e.path + '\n';
      for (const [method, details] of Object.entries(e.methods)) {
        info += `  [${method.toUpperCase()}] ${details.summary || ''}\n`;
        if (details.parameters) {
          info += `    Params: ${details.parameters.map(p => p.name).join(', ')}\n`;
        }
        if (details.requestBody && details.requestBody.content['application/json']) {
          const schema = details.requestBody.content['application/json'].schema;
          let props = [];
          if (schema.properties) {
            props = Object.keys(schema.properties);
          } else if (schema.required) {
            props = schema.required;
          }
          info += `    Body: ${props.join(', ')}\n`;
        }
      }
      return info;
    });
    
    console.log(output.join('\n'));
  });
});
