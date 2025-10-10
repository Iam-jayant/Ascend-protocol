# Ascend Protocol - Crypto Inheritance Platform

**India's First Crypto Inheritance Protocol** - A comprehensive Web3 platform that enables users to create inheritance vaults for their crypto assets with automatic distribution to beneficiaries.

## 🚀 Features

### Core Functionality
- **Deadman Switch Vaults**: Create inheritance vaults with configurable check-in periods
- **Minutes-Based Testing**: Quick testing mode for development and demonstration
- **Real-Time Balance Tracking**: Monitor wallet balances without pre-depositing funds
- **Email Notifications**: Automated email system for vault triggers and withdrawal credentials
- **Beneficiary Management**: Add multiple beneficiaries with customizable share percentages
- **UPI Integration**: Seamless crypto-to-fiat conversion for Indian users

### Technical Features
- **Smart Contracts**: Deployed on Sepolia testnet with factory pattern
- **Frontend**: Modern Next.js application with Tailwind CSS
- **Backend**: Node.js/Express API with Supabase database
- **Email Service**: Gmail SMTP integration for notifications
- **Wallet Integration**: RainbowKit + Wagmi for Web3 connectivity

## 📁 Project Structure

```
Ascend-protocol/
├── contracts/                 # Smart contracts
│   ├── AscendFactory.sol     # Factory contract for deploying vaults
│   ├── AscendVault.sol       # Individual vault contract
│   ├── interfaces/           # Contract interfaces
│   └── LiquidationEngine.sol # Asset liquidation logic
├── frontend/                 # Next.js frontend application
│   ├── src/app/             # App router pages
│   ├── src/hooks/           # Custom React hooks
│   └── src/lib/             # Utility libraries
├── backend/                  # Node.js backend API
│   ├── src/routes/          # API routes
│   ├── src/services/        # Business logic services
│   ├── src/config/          # Configuration files
│   └── src/middleware/      # Express middleware
└── scripts/                 # Deployment scripts
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git
- Gmail account (for email service)

### 1. Clone Repository
```bash
git clone <repository-url>
cd Ascend-protocol
```

### 2. Install Dependencies

#### Root Dependencies
```bash
npm install
```

#### Frontend Dependencies
```bash
cd frontend
npm install
```

#### Backend Dependencies
```bash
cd backend
npm install
```

### 3. Environment Configuration

#### Backend Environment (.env)
Create `backend/.env` file:
```env
# Database Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Server Configuration
PORT=3001
NODE_ENV=development

# Email Configuration (Gmail SMTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
FROM_EMAIL=noreply@ascendprotocol.in
FROM_NAME=Ascend Protocol

# Blockchain Configuration
SEPOLIA_RPC_URL=https://ethereum-sepolia.publicnode.com
SEPOLIA_CHAIN_ID=11155111
PRIVATE_KEY=your_private_key

# Contract Addresses (Sepolia)
ASCEND_FACTORY_ADDRESS=0xa3C193E814D17fB7536450DebcEC3bF8FA65C5cF
PRICE_ORACLE_ADDRESS=0x1cad2202F3c916209D7cF54c9E0Fef67e75b3997
LIQUIDATION_ENGINE_ADDRESS=0xc34E4E65023613f7b841E08b10eBDCC33EAcE541
UPI_BRIDGE_ADDRESS=0x988708C9aBaE80Ece464ad573DBc0b78F1981A4e

# Frontend URL
FRONTEND_URL=http://localhost:3002
```

#### Frontend Environment (.env.local)
Create `frontend/.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Gmail SMTP Setup
1. Enable 2-Factor Authentication on your Gmail account
2. Generate App Password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use the 16-character app password in `EMAIL_PASS`

## 🚀 Running the Application

### Development Mode

#### 1. Start Backend Server
```bash
cd backend
npm run dev
# Server runs on http://localhost:3001
```

#### 2. Start Frontend Application
```bash
cd frontend
npm run dev
# Application runs on http://localhost:3002
```

#### 3. Start Smart Contract Development
```bash
# In root directory
npx hardhat node
# Deploy contracts
npx hardhat run scripts/deploy-sepolia.js --network sepolia
```

## 📱 Usage Guide

### Creating a Vault
1. **Connect Wallet**: Use RainbowKit to connect your Web3 wallet
2. **Configure Settings**: 
   - Choose time unit (Days for production, Minutes for testing)
   - Set check-in period (e.g., 5 minutes for testing)
   - Set grace period (e.g., 2 minutes for testing)
3. **Add Beneficiaries**: Enter email, phone, and share percentage
4. **Create Vault**: Deploy smart contract and receive confirmation email

### Testing Deadman Switch
1. **Create Test Vault**: Use minutes-based configuration
2. **Wait for Trigger**: Don't check in within the specified time
3. **Trigger Vault**: Use the "Trigger Vault" button for testing
4. **Email Notifications**: Beneficiaries receive inheritance notifications

### Claim Process (Static Demo)
1. **Receive Email**: Get inheritance notification with claim link
2. **View Claim Page**: Access `/claim/static` for demonstration
3. **Review Details**: See inheritance amount and beneficiary information
4. **Bank Details**: Pre-filled demo bank details (non-functional)

## 🔧 API Endpoints

### Vault Management
- `POST /api/vaults` - Create new vault
- `GET /api/vaults` - List all vaults
- `GET /api/vaults/:id` - Get vault details
- `POST /api/vaults/:id/trigger` - Trigger vault (testing)
- `POST /api/vaults/:id/send-credentials` - Send withdrawal credentials

### Email Service
- Automatic vault creation confirmations
- Vault triggered notifications to beneficiaries
- Withdrawal credentials with claim links

## 🧪 Testing

### Email Testing
```bash
cd backend
node test-email.js
```

### API Testing
```bash
# Test vault creation
curl -X POST http://localhost:3001/api/vaults \
  -H "Content-Type: application/json" \
  -d '{"checkInPeriod":5,"gracePeriod":2,"timeUnit":"minutes"}'

# Test email sending
curl -X POST http://localhost:3001/api/vaults/vault-1/send-credentials \
  -H "Content-Type: application/json" \
  -d '{"beneficiaryEmail":"test@example.com","claimToken":"test-123","amount":"1000.00"}'
```

## 📊 Smart Contracts

### Deployed Contracts (Sepolia)
- **AscendFactory**: `0xa3C193E814D17fB7536450DebcEC3bF8FA65C5cF`
- **PriceOracle**: `0x1cad2202F3c916209D7cF54c9E0Fef67e75b3997`
- **LiquidationEngine**: `0xc34E4E65023613f7b841E08b10eBDCC33EAcE541`
- **UPI_Bridge**: `0x988708C9aBaE80Ece464ad573DBc0b78F1981A4e`

### Key Functions
- `createVault()` - Deploy new inheritance vault
- `checkIn()` - Reset deadman switch timer
- `trigger()` - Activate vault after deadline
- `distributeFunds()` - Distribute assets to beneficiaries

## 🎯 Key Features Implemented

### ✅ Completed Features
- [x] Smart contract deployment on Sepolia
- [x] Frontend vault creation with minutes-based testing
- [x] Backend API with demo data
- [x] Email service with Gmail SMTP
- [x] Wallet balance integration
- [x] Static claim page for demonstration
- [x] Vault triggering and notification system
- [x] Professional email templates

### 🔄 Demo Features (Non-Functional)
- [ ] OTP verification system
- [ ] Bank details submission
- [ ] Actual withdrawal processing
- [ ] UPI integration
- [ ] Real-time blockchain integration

## 🚀 Deployment

### Frontend Deployment
```bash
cd frontend
npm run build
npm start
```

### Backend Deployment
```bash
cd backend
npm start
```

### Smart Contract Deployment
```bash
npx hardhat run scripts/deploy-sepolia.js --network sepolia
```

## 🔒 Security Features

- **Encrypted Storage**: Sensitive data encrypted in database
- **App Passwords**: Gmail SMTP uses app passwords, not regular passwords
- **Input Validation**: All API inputs validated and sanitized
- **Rate Limiting**: API endpoints protected against abuse
- **Secure Headers**: Proper CORS and security headers

## 📈 Performance

- **Frontend**: Next.js with Turbopack for fast development
- **Backend**: Express.js with optimized middleware
- **Database**: Supabase with connection pooling
- **Email**: Gmail SMTP with retry logic

## 🐛 Troubleshooting

### Common Issues
1. **Email Not Sending**: Check Gmail app password and 2FA settings
2. **Wallet Connection**: Ensure MetaMask is installed and unlocked
3. **API Errors**: Check backend server is running on port 3001
4. **Database Issues**: Verify Supabase credentials and connection

### Debug Mode
- Set `NODE_ENV=development` for detailed logging
- Check browser console for frontend errors
- Monitor backend logs for API issues

## 📞 Support

For technical support or questions:
- Check the troubleshooting section above
- Review API logs for error details
- Verify environment configuration

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Ascend Protocol** - Revolutionizing crypto inheritance with automated deadman switch technology.