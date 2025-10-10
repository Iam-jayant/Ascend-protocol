#!/usr/bin/env node

/**
 * Email Configuration Test Script
 * Tests the email service with different providers
 */

import EmailService from './src/services/emailService.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testEmailConfiguration() {
  console.log('🧪 Testing Email Configuration');
  console.log('============================\n');

  try {
    const emailService = new EmailService();
    
    console.log('📧 Email Service Status:');
    console.log(`- Gmail User: ${process.env.EMAIL_USER ? '✅ Set' : '❌ Not set'}`);
    console.log(`- Gmail Password: ${process.env.EMAIL_PASS ? '✅ Set' : '❌ Not set'}`);
    console.log(`- From Email: ${process.env.FROM_EMAIL || 'noreply@ascendprotocol.in'}`);
    console.log(`- Service: Gmail SMTP\n`);

    if (!process.env.EMAIL_USER) {
      console.log('⚠️  No email credentials found. Running in demo mode.');
      console.log('📝 To enable real email sending:');
      console.log('   1. Set EMAIL_USER and EMAIL_PASS for Gmail SMTP');
      console.log('   2. Restart the server\n');
    }

    // Test vault triggered notification
    console.log('🧪 Testing Vault Triggered Notification...');
    const mockVault = {
      id: 'test-vault-123',
      address: '0x1234567890123456789012345678901234567890',
      checkInPeriod: 30,
      gracePeriod: 7,
      createdAt: new Date().toISOString()
    };

    const mockBeneficiaries = [
      {
        email: 'test@example.com',
        name: 'Test Beneficiary',
        sharePercentage: 50
      }
    ];

    await emailService.sendVaultTriggeredNotification(mockVault, mockBeneficiaries);
    console.log('✅ Vault triggered notification test completed\n');

    // Test withdrawal credentials
    console.log('🧪 Testing Withdrawal Credentials...');
    const mockClaimData = {
      claimToken: 'test-claim-token-123',
      amount: '1000.00',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    const mockBeneficiary = {
      email: 'test@example.com',
      name: 'Test Beneficiary',
      sharePercentage: 50
    };

    await emailService.sendWithdrawalCredentials(mockClaimData, mockBeneficiary);
    console.log('✅ Withdrawal credentials test completed\n');

    console.log('🎉 All email tests completed successfully!');
    
    if (process.env.EMAIL_USER) {
      console.log('📧 Real emails were sent (check your email inbox)');
    } else {
      console.log('📝 Demo mode: Emails were logged to console only');
    }

  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your email credentials in .env file');
    console.log('2. For Gmail: Use App Password, not regular password');
    console.log('3. Check network connectivity and firewall settings');
    console.log('4. Verify Gmail SMTP settings');
  }
}

testEmailConfiguration();
