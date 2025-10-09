import pkg from 'hardhat';
const { ethers } = pkg;

// Amoy Testnet Configuration (New Polygon Testnet)
const AMOY_CONFIG = {
  // Token addresses on Amoy testnet
  USDC: "0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582", // USDC on Amoy
  WMATIC: "0x9c3c9283d3e44854697cd22d3faa240cfb032889", // WMATIC on Amoy
  QUICKSWAP_ROUTER: "0x8954afa98594b838bda56fe4c12a09d7739d179b", // QuickSwap Router on Amoy
  
  // Chainlink Price Feed addresses on Amoy testnet
  MATIC_USD_FEED: "0x12162c3e810393dec01362abf156d7ecf6159528",
  USDC_USD_FEED: "0x572ddec9087154dc5dfbb1546bb62713147e0ab0",
};

async function main() {
  console.log("🚀 Starting Ascend Protocol deployment to Amoy testnet...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "MATIC\n");

  // Check if we have enough MATIC for deployment
  const balance = await deployer.provider.getBalance(deployer.address);
  if (balance < ethers.parseEther("0.1")) {
    console.log("⚠️  Warning: Low MATIC balance. You may need more MATIC for deployment.");
    console.log("Get testnet MATIC from: https://faucet.polygon.technology/\n");
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
      ethers.getAddress(AMOY_CONFIG.WMATIC), 
      ethers.getAddress(AMOY_CONFIG.MATIC_USD_FEED)
    );
    await priceOracle.setPriceFeed(
      ethers.getAddress(AMOY_CONFIG.USDC), 
      ethers.getAddress(AMOY_CONFIG.USDC_USD_FEED)
    );
    console.log("✅ Price feeds configured\n");

    // 2. Deploy LiquidationEngine
    console.log("💱 Deploying LiquidationEngine...");
    const LiquidationEngine = await ethers.getContractFactory("LiquidationEngine");
    const liquidationEngine = await LiquidationEngine.deploy(
      ethers.getAddress(AMOY_CONFIG.QUICKSWAP_ROUTER),
      priceOracleAddress,
      ethers.getAddress(AMOY_CONFIG.USDC),
      ethers.getAddress(AMOY_CONFIG.WMATIC)
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

    // 5. Deploy MockERC20 (for testing)
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
    console.log("Network: Amoy Testnet (Polygon)");
    console.log("Deployer:", deployer.address);
    console.log("Deployment Hash:", await deployer.provider.getTransactionCount(deployer.address));
    
    console.log("\n📄 CONTRACT ADDRESSES:");
    Object.entries(deployedContracts).forEach(([name, address]) => {
      console.log(`${name}: ${address}`);
    });

    console.log("\n🔗 AMOY TESTNET ADDRESSES:");
    console.log(`USDC: ${AMOY_CONFIG.USDC}`);
    console.log(`WMATIC: ${AMOY_CONFIG.WMATIC}`);
    console.log(`QuickSwap Router: ${AMOY_CONFIG.QUICKSWAP_ROUTER}`);

    console.log("\n📝 NEXT STEPS:");
    console.log("1. Verify contracts on Polygonscan:");
    console.log("   npx hardhat verify --network amoy <CONTRACT_ADDRESS> [constructor_args]");
    console.log("2. Test contract interactions");
    console.log("3. Update frontend with new contract addresses");
    console.log("4. Fund contracts with test tokens for testing");

    // Save deployment info to file
    const deploymentInfo = {
      network: "amoy",
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: deployedContracts,
      config: AMOY_CONFIG
    };

    const fs = await import('fs');
    fs.writeFileSync('deployment-amoy.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("\n💾 Deployment info saved to deployment-amoy.json");

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
