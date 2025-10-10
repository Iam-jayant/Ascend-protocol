import dotenv from 'dotenv';

dotenv.config();

// Service configurations
export const config = {
  // Server configuration
  server: {
    port: parseInt(process.env.PORT) || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:3002']
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },

  // Email configuration (SendGrid)
  email: {
    apiKey: process.env.SENDGRID_API_KEY,
    fromEmail: process.env.FROM_EMAIL || 'noreply@ascendprotocol.in',
    fromName: process.env.FROM_NAME || 'Ascend Protocol',
    templates: {
      welcome: 'd-welcome-template-id',
      claimToken: 'd-claim-template-id',
      payoutConfirmation: 'd-payout-template-id'
    }
  },

  // SMS configuration (Twilio)
  sms: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
    fromNumber: process.env.TWILIO_PHONE_NUMBER
  },

  // Razorpay configuration
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET
  },

  // Encryption configuration
  encryption: {
    key: process.env.ENCRYPTION_KEY || 'your-32-character-encryption-key-here',
    algorithm: 'aes-256-gcm'
  },

  // Rate limiting configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 5000 // Increased to 5000 requests per 15 minutes
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log'
  },

  // OTP configuration
  otp: {
    length: 6,
    expiryMinutes: 5,
    maxAttempts: 3
  },

  // Claim token configuration
  claimToken: {
    length: 32,
    expiryDays: 30
  },

  // Vault configuration
  vault: {
    defaultCheckInPeriod: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
    defaultGracePeriod: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    minCheckInPeriod: 24 * 60 * 60 * 1000, // 1 day minimum
    maxCheckInPeriod: 365 * 24 * 60 * 60 * 1000 // 1 year maximum
  },

  // Beneficiary configuration
  beneficiary: {
    maxBeneficiaries: 10,
    minSharePercentage: 100, // 1% (in basis points)
    maxSharePercentage: 10000 // 100% (in basis points)
  }
};

// Validation functions
export const validateConfig = () => {
  const required = [
    'JWT_SECRET',
    'DB_PASSWORD',
    'SENDGRID_API_KEY',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'ENCRYPTION_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn('⚠️  Missing required environment variables:', missing);
    console.warn('⚠️  Some features may not work properly');
  } else {
    console.log('✅ All required environment variables are set');
  }
};

export default config;

