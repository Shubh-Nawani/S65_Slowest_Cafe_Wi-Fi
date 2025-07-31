// Simple test script to verify server functionality
const http = require('http');

const testServer = () => {
    const options = {
        hostname: 'localhost',
        port: 4000,
        path: '/',
        method: 'GET'
    };

    const req = http.request(options, (res) => {
        console.log(`Status Code: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const response = JSON.parse(data);
                console.log('Response:', response);
                console.log('✅ Server is running correctly!');
            } catch (e) {
                console.log('❌ Invalid JSON response:', data);
            }
        });
    });

    req.on('error', (err) => {
        console.log('❌ Server connection failed:', err.message);
    });

    req.end();
};

// Wait a moment and then test
setTimeout(testServer, 2000);
