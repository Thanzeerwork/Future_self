#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 FutureSelf App Setup');
console.log('========================\n');

// Check if Firebase config exists
const firebaseConfigPath = path.join(__dirname, 'firebase.config.js');
const firebaseConfigContent = fs.readFileSync(firebaseConfigPath, 'utf8');

if (firebaseConfigContent.includes('your-api-key')) {
  console.log('⚠️  Firebase Configuration Required');
  console.log('Please update firebase.config.js with your Firebase project details:');
  console.log('1. Go to https://console.firebase.google.com/');
  console.log('2. Create a new project or select existing one');
  console.log('3. Enable Authentication, Firestore, Storage, and Cloud Functions');
  console.log('4. Copy your config and replace the placeholder values in firebase.config.js\n');
} else {
  console.log('✅ Firebase configuration looks good!\n');
}

// Check if node_modules exists
if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
  console.log('📦 Installing dependencies...');
  console.log('Run: npm install\n');
} else {
  console.log('✅ Dependencies are installed!\n');
}

console.log('🎯 Next Steps:');
console.log('1. Update firebase.config.js with your Firebase credentials');
console.log('2. Run: npm install (if not done already)');
console.log('3. Run: npm start');
console.log('4. Scan the QR code with Expo Go app on your phone');
console.log('5. Or run: npm run android/ios for emulator\n');

console.log('📚 Documentation:');
console.log('- README.md contains detailed setup instructions');
console.log('- Check src/constants/ for app configuration');
console.log('- Firebase security rules are provided in README.md\n');

console.log('🎉 Happy coding with FutureSelf!');
