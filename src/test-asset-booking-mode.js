const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001, // NextJS API might be 3001 or 3000, let's assume it calls an external backend or local
  path: '/api/admin/assets/cmlvp26220000gpx8ciniy09k/booking-mode',
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(JSON.stringify({ bookingMode: 'STATIC' }));
req.end();
