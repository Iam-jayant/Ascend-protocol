# Mumbai Testnet Deployment Guide

## Prerequisites

Before deploying to Mumbai testnet, you need to:

1. **Create a .env file** in the project root with the following content:

```env
# Mumbai Testnet Configuration
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
PRIVATE_KEY=your_private_key_here
POLYGONSCAN_API_KEY=your_polygonscan_api_key_here

# Optional: Gas Reporting
REPORT_GAS=false
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key_here
```

2. **Get Mumbai Testnet MATIC**:
   - Visit: https://faucet.polygon.technology/
   - Connect your wallet and request testnet MATIC
   - You need at least 0.1 MATIC for deployment

3. **Get Polygonscan API Key** (optional, for verification):
   - Visit: https://polygonscan.com/apis
   - Create an account and get your API key

## Deployment Commands

### Deploy to Mumbai Testnet
```bash
npm run deploy:mumbai
```

### Deploy to Polygon Mainnet
```bash
npm run deploy:polygon
```

## Contract Addresses on Mumbai Testnet

The deployment script will use these pre-configured addresses:

- **USDC**: `0x0FA8781a83E46826621b3DC094C2eD7C2C0e36c4`
- **WMATIC**: `0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889`
- **QuickSwap Router**: `0x8954AfA98594b838bda56FE4C12a09D7739D179b`

## Chainlink Price Feeds (Mumbai)

- **MATIC/USD**: `0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada`
- **USDC/USD**: `0x572dDec9087154dC5dfBB1546Bb62713147e0Ab0`

## Post-Deployment Steps

1. **Verify Contracts** (optional):
   ```bash
   npx hardhat verify --network mumbai <CONTRACT_ADDRESS> [constructor_args]
   ```

2. **Test Contract Interactions**:
   - Create a vault using AscendFactory
   - Add beneficiaries to the vault
   - Test the liquidation engine

3. **Update Frontend**:
   - Use the deployed contract addresses in your frontend application

## Troubleshooting

- **Low MATIC Balance**: Get more testnet MATIC from the faucet
- **Gas Price Issues**: The script uses 30 gwei for Mumbai testnet
- **RPC Issues**: Try alternative RPC endpoints if the default one fails

## Security Notes

- Never commit your `.env` file to version control
- Use testnet MATIC only for testing
- Verify all contract interactions before mainnet deployment
