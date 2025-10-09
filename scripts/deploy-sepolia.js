import pkg from 'hardhat';
const { ethers } = pkg;

// Sepolia Testnet Configuration
const SEPOLIA_CONFIG = {
  // Token addresses on Sepolia testnet
  USDC: "0x6f14c02fc1f78322cfd7d707ab90f18bad3b54f5", // USDC on Sepolia (lowercase)
  WETH: "0xfff9976782d46cc05630d1f6ebab18b2324d6b14", // WETH on Sepolia (lowercase)
  UNISWAP_ROUTER: "0x3bfa4769fb09eefc5a80d6e87c3b9c650f7ae48e", // Uniswap V3 Router (lowercase)
  
  // Chainlink Price Feed addresses on Sepolia testnet
  ETH_USD_FEED: "0x694aa1769357215de4fac081bf1f309adc325306",
  USDC_USD_FEED: "0x694aa1769357215de4fac081bf1f309adc325306", // Using ETH/USD feed for demo
};

async function main() {
  console.log("🚀 Starting Ascend Protocol deployment to Sepolia testnet...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH\n");

  // Check if we have enough ETH for deployment
  const balance = await deployer.provider.getBalance(deployer.address);
  if (balance < ethers.parseEther("0.01")) {
    console.log("⚠️  Warning: Low ETH balance. You may need more ETH for deployment.");
  }

  const deployedContracts = {};

  try {
    // 1. Deploy PriceOracle
    console.log("📊 Deploying PriceOracle...");
    const PriceOracle = await ethers.getContractFactory("PriceOracle");
    const priceOracle = await PriceOracle.deploy();
    await priceOracle.waitForDeployment();
    const priceOracleAddress = await priceOracle.getAddress();
    deployedContracts.PriceOracle = priceOracleAddress;
    console.log("✅ PriceOracle deployed to:", priceOracleAddress);

    // Set up price feeds
    console.log("🔗 Setting up Chainlink price feeds...");
    await priceOracle.setPriceFeed(
      ethers.getAddress(SEPOLIA_CONFIG.WETH), 
      ethers.getAddress(SEPOLIA_CONFIG.ETH_USD_FEED)
    );
    await priceOracle.setPriceFeed(
      ethers.getAddress(SEPOLIA_CONFIG.USDC), 
      ethers.getAddress(SEPOLIA_CONFIG.USDC_USD_FEED)
    );
    console.log("✅ Price feeds configured\n");

    // 2. Deploy LiquidationEngineSepolia (using WETH instead of WMATIC)
    console.log("💱 Deploying LiquidationEngineSepolia...");
    const LiquidationEngineSepolia = await ethers.getContractFactory("LiquidationEngineSepolia");
    const liquidationEngine = await LiquidationEngineSepolia.deploy(
      ethers.getAddress(SEPOLIA_CONFIG.UNISWAP_ROUTER),
      priceOracleAddress,
      ethers.getAddress(SEPOLIA_CONFIG.USDC),
      ethers.getAddress(SEPOLIA_CONFIG.WETH)
    );
    await liquidationEngine.waitForDeployment();
    const liquidationEngineAddress = await liquidationEngine.getAddress();
    deployedContracts.LiquidationEngine = liquidationEngineAddress;
    console.log("✅ LiquidationEngine deployed to:", liquidationEngineAddress);

    // 3. Deploy UPIBridge
    console.log("🏦 Deploying UPIBridge...");
    const UPIBridge = await ethers.getContractFactory("UPIBridge");
    const upiBridge = await UPIBridge.deploy();
    await upiBridge.waitForDeployment();
    const upiBridgeAddress = await upiBridge.getAddress();
    deployedContracts.UPIBridge = upiBridgeAddress;
    console.log("✅ UPIBridge deployed to:", upiBridgeAddress);

    // 4. Deploy AscendFactory
    console.log("🏭 Deploying AscendFactory...");
    const AscendFactory = await ethers.getContractFactory("AscendFactory");
    const ascendFactory = await AscendFactory.deploy();
    await ascendFactory.waitForDeployment();
    const ascendFactoryAddress = await ascendFactory.getAddress();
    deployedContracts.AscendFactory = ascendFactoryAddress;
    console.log("✅ AscendFactory deployed to:", ascendFactoryAddress);

    // 5. Deploy MockERC20 for testing
    console.log("🪙 Deploying MockERC20 for testing...");
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const mockERC20 = await MockERC20.deploy("Test Token", "TEST", ethers.parseEther("1000000"));
    await mockERC20.waitForDeployment();
    const mockERC20Address = await mockERC20.getAddress();
    deployedContracts.MockERC20 = mockERC20Address;
    console.log("✅ MockERC20 deployed to:", mockERC20Address);

    // Display deployment summary
    console.log("\n🎉 Deployment completed successfully!");
    console.log("=" * 60);
    console.log("📋 DEPLOYMENT SUMMARY");
    console.log("=" * 60);
    console.log("Network: Sepolia Testnet (Ethereum)");
    console.log("Deployer:", deployer.address);
    console.log("Deployment Hash:", await deployer.provider.getTransactionCount(deployer.address));
    
    console.log("\n📄 CONTRACT ADDRESSES:");
    Object.entries(deployedContracts).forEach(([name, address]) => {
      console.log(`${name}: ${address}`);
    });

    console.log("\n🔗 SEPOLIA TESTNET ADDRESSES:");
    console.log(`USDC: ${SEPOLIA_CONFIG.USDC}`);
    console.log(`WETH: ${SEPOLIA_CONFIG.WETH}`);
    console.log(`Uniswap Router: ${SEPOLIA_CONFIG.UNISWAP_ROUTER}`);

    console.log("\n📝 NEXT STEPS:");
    console.log("1. Verify contracts on Etherscan:");
    console.log("   npx hardhat verify --network sepolia <CONTRACT_ADDRESS> [constructor_args]");
    console.log("2. Test contract interactions");
    console.log("3. Update frontend with new contract addresses");
    console.log("4. Fund contracts with test tokens for testing");

    // Save deployment info to file
    const deploymentInfo = {
      network: "sepolia",
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: deployedContracts,
      config: SEPOLIA_CONFIG
    };

    const fs = await import('fs');
    fs.writeFileSync('deployment-sepolia.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("\n💾 Deployment info saved to deployment-sepolia.json");

    console.log("\n🚀 READY FOR YOUR PRESENTATION!");
    console.log("✅ All contracts deployed on Sepolia testnet");
    console.log("✅ Real testnet environment");
    console.log("✅ Ready for demo and testing");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
