import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

// Sepolia Testnet Configuration
const SEPOLIA_CONFIG = {
  rpcUrl: process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia.publicnode.com",
  chainId: parseInt(process.env.SEPOLIA_CHAIN_ID) || 11155111,
  contracts: {
    ascendFactory: process.env.ASCEND_FACTORY_ADDRESS || "0xa3C193E814D17fB7536450DebcEC3bF8FA65C5cF",
    priceOracle: process.env.PRICE_ORACLE_ADDRESS || "0x1cad2202F3c916209D7cF54c9E0Fef67e75b3997",
    liquidationEngine: process.env.LIQUIDATION_ENGINE_ADDRESS || "0xc34E4E65023613f7b841E08b10eBDCC33EAcE541",
    upiBridge: process.env.UPI_BRIDGE_ADDRESS || "0x988708C9aBaE80Ece464ad573DBc0b78F1981A4e"
  }
};

// Contract ABIs (simplified for demo)
const CONTRACT_ABIS = {
  AscendFactory: [
    "function createVault() external returns (address)",
    "function createVaultWithParams(uint256 _checkInPeriod, uint256 _gracePeriod) external returns (address)",
    "function getUserVaults(address _user) external view returns (address[])",
    "function getTotalVaults() external view returns (uint256)",
    "event VaultCreated(address indexed owner, address indexed vaultAddress, uint256 checkInPeriod, uint256 gracePeriod, uint256 vaultIndex)"
  ],
  AscendVault: [
    "function checkIn() external",
    "function addBeneficiary(address payable _beneficiary, uint256 _sharePercentage) external",
    "function removeBeneficiary(address _beneficiary) external",
    "function updateBeneficiaryShare(address _beneficiary, uint256 _newShare) external",
    "function trigger() external",
    "function distributeFunds(address _usdcAddress) external",
    "function canTrigger() external view returns (bool)",
    "function getTimeRemaining() external view returns (uint256)",
    "function getBeneficiaries() external view returns (tuple(address beneficiaryAddress, uint256 sharePercentage, bool isActive)[])",
    "function getVaultBalance(address _token) external view returns (uint256)",
    "function owner() external view returns (address)",
    "function lastCheckIn() external view returns (uint256)",
    "function checkInPeriod() external view returns (uint256)",
    "function gracePeriod() external view returns (uint256)",
    "function isTriggered() external view returns (bool)",
    "event CheckedIn(address indexed owner, uint256 nextDeadline)",
    "event BeneficiaryAdded(address indexed beneficiary, uint256 sharePercentage)",
    "event BeneficiaryRemoved(address indexed beneficiary)",
    "event BeneficiaryUpdated(address indexed beneficiary, uint256 newShare)",
    "event VaultTriggered(address indexed owner, uint256 timestamp)",
    "event FundsDistributed(address indexed beneficiary, uint256 amount)",
    "event EmergencyWithdrawal(address indexed token, uint256 amount, address indexed owner)",
    "event TokenDeposited(address indexed token, uint256 amount)"
  ],
  LiquidationEngineSepolia: [
    "function liquidateToUSDC(address _tokenAddress, uint256 _amount, address _recipient) external returns (uint256)",
    "function batchLiquidate(address[] calldata _tokens, uint256[] calldata _amounts, address _recipient) external returns (uint256)",
    "function previewSwap(address _tokenAddress, uint256 _amount) external view returns (uint256)",
    "function canLiquidateToken(address _tokenAddress) external view returns (bool)",
    "event TokenLiquidated(address indexed fromToken, address indexed toToken, uint256 amountIn, uint256 amountOut, address indexed recipient)"
  ],
  PriceOracle: [
    "function setPriceFeed(address _token, address _priceFeed) external",
    "function getTokenPrice(address _token) external view returns (uint256)",
    "function getSafePrice(address _token) external view returns (uint256 price, bool isValid)",
    "function hasPriceFeed(address _token) external view returns (bool)",
    "event PriceFeedSet(address indexed token, address indexed priceFeed)"
  ],
  UPIBridge: [
    "function recordPayout(address _vaultAddress, address _beneficiary, uint256 _usdcAmount, string calldata _upiId) external returns (bytes32)",
    "function updatePayoutStatus(bytes32 _payoutId, uint8 _newStatus, string calldata _razorpayPaymentId) external",
    "function getPayout(bytes32 _payoutId) external view returns (tuple(address vaultAddress, address beneficiary, uint256 usdcAmount, uint256 inrAmount, string upiId, string razorpayPaymentId, uint256 timestamp, uint8 status))",
    "function getVaultPayouts(address _vaultAddress) external view returns (bytes32[])",
    "function getBeneficiaryPayouts(address _beneficiary) external view returns (bytes32[])",
    "event PayoutRecorded(bytes32 indexed payoutId, address indexed vaultAddress, address indexed beneficiary, uint256 usdcAmount, uint256 inrAmount, string upiId)"
  ]
};

// Initialize provider and signer
let provider;
let signer;

try {
  provider = new ethers.JsonRpcProvider(SEPOLIA_CONFIG.rpcUrl);
  
  if (process.env.PRIVATE_KEY && process.env.PRIVATE_KEY !== '0xyour_private_key_here') {
    signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log('✅ Blockchain provider and signer initialized for Sepolia');
  } else {
    console.log('⚠️  No valid private key provided - read-only mode');
  }
} catch (error) {
  console.error('❌ Failed to initialize blockchain provider:', error.message);
}

// Contract instances
const contracts = {};

if (provider) {
  try {
    // Initialize contract instances
    contracts.ascendFactory = new ethers.Contract(
      SEPOLIA_CONFIG.contracts.ascendFactory,
      CONTRACT_ABIS.AscendFactory,
      signer || provider
    );
    
    contracts.priceOracle = new ethers.Contract(
      SEPOLIA_CONFIG.contracts.priceOracle,
      CONTRACT_ABIS.PriceOracle,
      signer || provider
    );
    
    contracts.liquidationEngine = new ethers.Contract(
      SEPOLIA_CONFIG.contracts.liquidationEngine,
      CONTRACT_ABIS.LiquidationEngineSepolia,
      signer || provider
    );
    
    contracts.upiBridge = new ethers.Contract(
      SEPOLIA_CONFIG.contracts.upiBridge,
      CONTRACT_ABIS.UPIBridge,
      signer || provider
    );
    
    console.log('✅ Contract instances initialized');
  } catch (error) {
    console.error('❌ Failed to initialize contract instances:', error.message);
  }
}

// Helper functions
const getVaultContract = (vaultAddress) => {
  return new ethers.Contract(vaultAddress, CONTRACT_ABIS.AscendVault, signer || provider);
};

const getContractAddress = (contractName) => {
  return SEPOLIA_CONFIG.contracts[contractName];
};

const getProvider = () => provider;
const getSigner = () => signer;

export {
  SEPOLIA_CONFIG,
  CONTRACT_ABIS,
  contracts,
  getVaultContract,
  getContractAddress,
  getProvider,
  getSigner
};

