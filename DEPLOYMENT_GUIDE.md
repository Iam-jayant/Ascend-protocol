# Vercel Deployment Guide for Ascend Protocol

## 🚀 Frontend Deployment (Vercel)

### 1. Prepare Frontend for Vercel
The frontend is already configured for Vercel deployment with:
- ✅ Next.js 15 with App Router
- ✅ Tailwind CSS configured
- ✅ Vercel-optimized next.config.ts
- ✅ Environment variables setup

### 2. Deploy to Vercel

#### Option A: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend directory
cd frontend

# Deploy
vercel

# Follow prompts:
# - Link to existing project or create new
# - Set framework: Next.js
# - Set build command: npm run build
# - Set output directory: .next
```

#### Option B: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Set root directory to `frontend`
4. Configure environment variables (see below)
5. Deploy

### 3. Environment Variables for Frontend
Set these in Vercel dashboard:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app
```

## 🔧 Backend Deployment Options

### Option A: Vercel Serverless Functions
Create `api/` directory in frontend and move backend routes there.

### Option B: Separate Backend Deployment
Deploy backend separately on:
- **Vercel**: As serverless functions
- **Railway**: For persistent backend
- **Render**: For full-stack deployment
- **Heroku**: Traditional deployment

### Option C: Backend on Railway (Recommended)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

## 📋 Deployment Checklist

### Frontend (Vercel)
- [x] Next.js configuration optimized
- [x] Environment variables configured
- [x] Build command set
- [x] Output directory configured
- [x] Region set to Mumbai (bom1)

### Backend (Separate Service)
- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] Email service working
- [ ] API endpoints accessible
- [ ] CORS configured for frontend domain

### Smart Contracts
- [x] Deployed on Sepolia testnet
- [x] Contract addresses documented
- [x] ABI files available

## 🌐 Production URLs

### Frontend
- **Vercel**: `https://ascend-protocol.vercel.app`
- **Custom Domain**: `https://ascendprotocol.in` (if configured)

### Backend
- **Railway**: `https://ascend-protocol-backend.railway.app`
- **Render**: `https://ascend-protocol-backend.onrender.com`

### Smart Contracts
- **Sepolia**: All contracts deployed and verified
- **Etherscan**: Contract addresses documented in README

## 🔧 Environment Configuration

### Frontend Environment Variables
```env
NEXT_PUBLIC_API_URL=https://ascend-protocol-backend.railway.app
```

### Backend Environment Variables
```env
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Server
PORT=3001
NODE_ENV=production

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
FROM_EMAIL=noreply@ascendprotocol.in
FROM_NAME=Ascend Protocol

# Blockchain
SEPOLIA_RPC_URL=https://ethereum-sepolia.publicnode.com
SEPOLIA_CHAIN_ID=11155111
PRIVATE_KEY=your_private_key

# Contracts (Already Deployed)
ASCEND_FACTORY_ADDRESS=0xa3C193E814D17fB7536450DebcEC3bF8FA65C5cF
PRICE_ORACLE_ADDRESS=0x1cad2202F3c916209D7cF54c9E0Fef67e75b3997
LIQUIDATION_ENGINE_ADDRESS=0xc34E4E65023613f7b841E08b10eBDCC33EAcE541
UPI_BRIDGE_ADDRESS=0x988708C9aBaE80Ece464ad573DBc0b78F1981A4e

# Frontend URL
FRONTEND_URL=https://ascend-protocol.vercel.app
```

## 🧪 Testing Production Deployment

### 1. Test Frontend
```bash
# Build locally
cd frontend
npm run build
npm start

# Test production build
curl https://ascend-protocol.vercel.app
```

### 2. Test Backend API
```bash
# Test health endpoint
curl https://ascend-protocol-backend.railway.app/health

# Test vault creation
curl -X POST https://ascend-protocol-backend.railway.app/api/vaults \
  -H "Content-Type: application/json" \
  -d '{"checkInPeriod":5,"gracePeriod":2,"timeUnit":"minutes"}'
```

### 3. Test Email Service
```bash
# Test email sending
curl -X POST https://ascend-protocol-backend.railway.app/api/vaults/vault-1/send-credentials \
  -H "Content-Type: application/json" \
  -d '{"beneficiaryEmail":"test@example.com","claimToken":"test-123","amount":"1000.00"}'
```

## 🚀 Quick Deploy Commands

### Frontend to Vercel
```bash
cd frontend
vercel --prod
```

### Backend to Railway
```bash
cd backend
railway up --service backend
```

## 📊 Production Monitoring

### Vercel Analytics
- Enable in Vercel dashboard
- Monitor performance and usage

### Railway Monitoring
- Built-in metrics and logs
- Health checks and uptime monitoring

### Smart Contract Monitoring
- Etherscan for transaction monitoring
- Contract interaction tracking

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env` files
- Use Vercel/Railway environment variable settings
- Rotate API keys regularly

### CORS Configuration
- Configure backend CORS for frontend domain
- Restrict API access to known origins

### Rate Limiting
- Implement rate limiting on API endpoints
- Monitor for abuse and DDoS attacks

---

**Ready for Production Deployment!** 🚀

The project is fully prepared for Vercel deployment with smart contracts already on Sepolia testnet.
