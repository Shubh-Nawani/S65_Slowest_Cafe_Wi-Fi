#!/usr/bin/env node

// Simple validation script to check for common issues
const fs = require('fs');
const path = require('path');

const filesToCheck = [
    'server.js',
    'config/db.js',
    'controllers/userController.js',
    'controllers/cafeController.js',
    'models/userModel.js',
    'models/cafeModel.js',
    'routes/userRoute.js',
    'routes/cafeRoute.js'
];

console.log('🔍 Checking server files for common issues...\n');

filesToCheck.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        console.log(`✅ ${file} - File exists and readable`);
        
        // Check for basic issues
        if (content.includes('console.log') && !content.includes('console.error')) {
            console.log(`   ⚠️  Consider using console.error for error logging`);
        }
        
        // Check for proper error handling
        if (file.includes('Controller') && !content.includes('try') && !content.includes('catch')) {
            console.log(`   ⚠️  No try-catch blocks found in controller`);
        }
        
        // Check for validation
        if (file.includes('Controller') && !content.includes('validationResult')) {
            console.log(`   ⚠️  No validation found in controller`);
        }
        
    } else {
        console.log(`❌ ${file} - File not found`);
    }
});

console.log('\n✅ Server validation complete!');
