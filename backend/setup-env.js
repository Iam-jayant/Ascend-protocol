#!/usr/bin/env node

/**
 * Environment Setup Script for Ascend Protocol
 * This script helps you set up the .env file with proper SMTP configuration
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setupEnvironment() {
  console.log('🚀 Ascend Protocol Environment Setup');
  console.log('=====================================\n');

  const envPath = path.join(process.cwd(), '.env');
  
  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    const overwrite = await question('⚠️  .env file already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('❌ Setup cancelled.');
      rl.close();
      return;
    }
  }

  console.log('📧 Email Configuration Setup\n');
  
  const emailProvider = await question('Choose email provider:\n1. Gmail SMTP (recommended)\n2. Skip email setup\nEnter choice (1-2): ');

  let envContent = `# Database Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Server Configuration
PORT=3001
NODE_ENV=development

# Email Configuration
`;

  if (emailProvider === '1') {
    console.log('\n📧 Gmail SMTP Setup');
    console.log('You need to:');
    console.log('1. Enable 2-Factor Authentication on your Gmail account');
    console.log('2. Generate an App Password (not your regular password)');
    console.log('3. Go to: Google Account → Security → 2-Step Verification → App passwords\n');
    
    const gmailUser = await question('Enter your Gmail address: ');
    const gmailPass = await question('Enter your Gmail App Password (16 characters): ');
    
    envContent += `EMAIL_USER=${gmailUser}
EMAIL_PASS=${gmailPass}
`;
  } else {
    console.log('\n⏭️  Skipping email setup. You can configure it later in the .env file.');
  }

  envContent += `
# Email Settings
FROM_EMAIL=noreply@ascendprotocol.in
FROM_NAME=Ascend Protocol

# Blockchain Configuration
RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_private_key_here

# Encryption
ENCRYPTION_KEY=your-32-character-encryption-key-here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=5000

# Frontend URL
FRONTEND_URL=http://localhost:3002
`;

  // Write .env file
  fs.writeFileSync(envPath, envContent);
  
  console.log('\n✅ .env file created successfully!');
  console.log(`📁 Location: ${envPath}`);
  
  if (emailProvider === '1' || emailProvider === '2') {
    console.log('\n🧪 Testing Email Configuration...');
    console.log('You can test email functionality by:');
    console.log('1. Starting the backend server: npm run dev');
    console.log('2. Testing via API: curl -X POST http://localhost:3001/api/vaults/vault-1/send-credentials \\');
    console.log('   -H "Content-Type: application/json" \\');
    console.log('   -d \'{"beneficiaryEmail":"test@example.com","claimToken":"test-123","amount":"1000.00"}\'');
  } else {
    console.log('\n📝 To configure email later:');
    console.log('1. Edit the .env file');
    console.log('2. Add EMAIL_USER and EMAIL_PASS for Gmail SMTP');
    console.log('3. Or add SENDGRID_API_KEY for SendGrid');
    console.log('4. Restart the backend server');
  }

  console.log('\n📚 For more details, see: backend/SMTP_SETUP.md');
  
  rl.close();
}

setupEnvironment().catch(console.error);
