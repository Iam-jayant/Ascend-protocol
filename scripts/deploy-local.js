import pkg from 'hardhat';
const { ethers } = pkg;

// Local Hardhat Network Configuration
const LOCAL_CONFIG = {
  // Mock token addresses (we'll deploy these locally)
  USDC: "0x0000000000000000000000000000000000000000", // Will be set after deployment
  WMATIC: "0x0000000000000000000000000000000000000000", // Will be set after deployment
  QUICKSWAP_ROUTER: "0x0000000000000000000000000000000000000000", // Mock router
  
  // Mock Chainlink Price Feed addresses
  MATIC_USD_FEED: "0x0000000000000000000000000000000000000000",
  USDC_USD_FEED: "0x0000000000000000000000000000000000000000",
};

async function main() {
  console.log("🚀 Starting Ascend Protocol deployment to Local Hardhat Network...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH\n");

  const deployedContracts = {};

  try {
    // 1. Deploy Mock Tokens first
    console.log("🪙 Deploying Mock Tokens...");
    
    // Deploy Mock USDC
    const MockUSDC = await ethers.getContractFactory("MockERC20");
    const mockUSDC = await MockUSDC.deploy("USD Coin", "USDC", ethers.parseUnits("1000000", 6)); // 1M USDC with 6 decimals
    await mockUSDC.waitForDeployment();
    const mockUSDCAddress = await mockUSDC.getAddress();
    deployedContracts.MockUSDC = mockUSDCAddress;
    console.log("✅ Mock USDC deployed to:", mockUSDCAddress);

    // Deploy Mock WMATIC
    const MockWMATIC = await ethers.getContractFactory("MockERC20");
    const mockWMATIC = await MockWMATIC.deploy("Wrapped MATIC", "WMATIC", ethers.parseEther("1000000")); // 1M WMATIC with 18 decimals
    await mockWMATIC.waitForDeployment();
    const mockWMATICAddress = await mockWMATIC.getAddress();
    deployedContracts.MockWMATIC = mockWMATICAddress;
    console.log("✅ Mock WMATIC deployed to:", mockWMATICAddress);

    // Deploy Mock QuickSwap Router
    const MockRouter = await ethers.getContractFactory("MockERC20");
    const mockRouter = await MockRouter.deploy("QuickSwap Router", "ROUTER", ethers.parseEther("1"));
    await mockRouter.waitForDeployment();
    const mockRouterAddress = await mockRouter.getAddress();
    deployedContracts.MockRouter = mockRouterAddress;
    console.log("✅ Mock Router deployed to:", mockRouterAddress);

    // Update config with deployed addresses
    LOCAL_CONFIG.USDC = mockUSDCAddress;
    LOCAL_CONFIG.WMATIC = mockWMATICAddress;
    LOCAL_CONFIG.QUICKSWAP_ROUTER = mockRouterAddress;

    // 2. Deploy PriceOracle
    console.log("\n📊 Deploying PriceOracle...");
    const PriceOracle = await ethers.getContractFactory("PriceOracle");
    const priceOracle = await PriceOracle.deploy();
    await priceOracle.waitForDeployment();
    const priceOracleAddress = await priceOracle.getAddress();
    deployedContracts.PriceOracle = priceOracleAddress;
    console.log("✅ PriceOracle deployed to:", priceOracleAddress);

    // Set up mock price feeds (using mock addresses)
    console.log("🔗 Setting up mock price feeds...");
    await priceOracle.setPriceFeed(
      mockWMATICAddress, 
      "0x1111111111111111111111111111111111111111" // Mock MATIC/USD feed
    );
    await priceOracle.setPriceFeed(
      mockUSDCAddress, 
      "0x2222222222222222222222222222222222222222" // Mock USDC/USD feed
    );
    console.log("✅ Mock price feeds configured");

    // 3. Deploy LiquidationEngine
    console.log("\n💱 Deploying LiquidationEngine...");
    const LiquidationEngine = await ethers.getContractFactory("LiquidationEngine");
    const liquidationEngine = await LiquidationEngine.deploy(
      mockRouterAddress,
      priceOracleAddress,
      mockUSDCAddress,
      mockWMATICAddress
    );
    await liquidationEngine.waitForDeployment();
    const liquidationEngineAddress = await liquidationEngine.getAddress();
    deployedContracts.LiquidationEngine = liquidationEngineAddress;
    console.log("✅ LiquidationEngine deployed to:", liquidationEngineAddress);

    // 4. Deploy UPIBridge
    console.log("\n🏦 Deploying UPIBridge...");
    const UPIBridge = await ethers.getContractFactory("UPIBridge");
    const upiBridge = await UPIBridge.deploy();
    await upiBridge.waitForDeployment();
    const upiBridgeAddress = await upiBridge.getAddress();
    deployedContracts.UPIBridge = upiBridgeAddress;
    console.log("✅ UPIBridge deployed to:", upiBridgeAddress);

    // 5. Deploy AscendFactory
    console.log("\n🏭 Deploying AscendFactory...");
    const AscendFactory = await ethers.getContractFactory("AscendFactory");
    const ascendFactory = await AscendFactory.deploy();
    await ascendFactory.waitForDeployment();
    const ascendFactoryAddress = await ascendFactory.getAddress();
    deployedContracts.AscendFactory = ascendFactoryAddress;
    console.log("✅ AscendFactory deployed to:", ascendFactoryAddress);

    // 6. Deploy additional MockERC20 for testing
    console.log("\n🪙 Deploying additional MockERC20...");
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
    console.log("Network: Local Hardhat Network");
    console.log("Deployer:", deployer.address);
    console.log("Deployment Hash:", await deployer.provider.getTransactionCount(deployer.address));
    
    console.log("\n📄 CONTRACT ADDRESSES:");
    Object.entries(deployedContracts).forEach(([name, address]) => {
      console.log(`${name}: ${address}`);
    });

    console.log("\n🔗 LOCAL NETWORK ADDRESSES:");
    console.log(`USDC: ${mockUSDCAddress}`);
    console.log(`WMATIC: ${mockWMATICAddress}`);
    console.log(`QuickSwap Router: ${mockRouterAddress}`);

    console.log("\n📝 PRESENTATION READY!");
    console.log("✅ All contracts deployed successfully");
    console.log("✅ Mock tokens available for testing");
    console.log("✅ Ready for demo and testing");

    // Save deployment info to file
    const deploymentInfo = {
      network: "hardhat",
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: deployedContracts,
      config: LOCAL_CONFIG
    };

    const fs = await import('fs');
    fs.writeFileSync('deployment-local.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("\n💾 Deployment info saved to deployment-local.json");

    console.log("\n🚀 READY FOR YOUR PRESENTATION!");
    console.log("You can now:");
    console.log("1. Create vaults using AscendFactory");
    console.log("2. Add beneficiaries to vaults");
    console.log("3. Test the liquidation engine");
    console.log("4. Demonstrate the UPI bridge functionality");

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
