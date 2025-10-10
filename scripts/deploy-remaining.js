import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  console.log("🚀 Deploying remaining contract to Sepolia...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH\n");

  try {
    // Deploy AscendFactory
    console.log("🏭 Deploying AscendFactory...");
    const AscendFactory = await ethers.getContractFactory("AscendFactory");
    const ascendFactory = await AscendFactory.deploy();
    await ascendFactory.waitForDeployment();
    const ascendFactoryAddress = await ascendFactory.getAddress();
    console.log("✅ AscendFactory deployed to:", ascendFactoryAddress);

    // Deploy MockERC20 for testing
    console.log("🪙 Deploying MockERC20 for testing...");
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const mockERC20 = await MockERC20.deploy("Test Token", "TEST", ethers.parseEther("1000000"));
    await mockERC20.waitForDeployment();
    const mockERC20Address = await mockERC20.getAddress();
    console.log("✅ MockERC20 deployed to:", mockERC20Address);

    console.log("\n🎉 All remaining contracts deployed successfully!");
    console.log("=" * 60);
    console.log("📋 COMPLETED DEPLOYMENT");
    console.log("=" * 60);
    console.log("Network: Sepolia Testnet (Ethereum)");
    console.log("Deployer:", deployer.address);
    
    console.log("\n📄 NEW CONTRACT ADDRESSES:");
    console.log(`AscendFactory: ${ascendFactoryAddress}`);
    console.log(`MockERC20: ${mockERC20Address}`);

    console.log("\n📄 ALL DEPLOYED CONTRACTS:");
    console.log("PriceOracle: 0x1cad2202F3c916209D7cF54c9E0Fef67e75b3997");
    console.log("LiquidationEngine: 0xc34E4E65023613f7b841E08b10eBDCC33EAcE541");
    console.log("UPIBridge: 0x988708C9aBaE80Ece464ad573DBc0b78F1981A4e");
    console.log(`AscendFactory: ${ascendFactoryAddress}`);
    console.log(`MockERC20: ${mockERC20Address}`);

    console.log("\n🚀 SEPOLIA DEPLOYMENT COMPLETE!");
    console.log("✅ All 5 contracts deployed on Sepolia testnet");
    console.log("✅ Real testnet environment");
    console.log("✅ Ready for presentation and demos");

    // Save deployment info to file
    const deploymentInfo = {
      network: "sepolia",
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: {
        PriceOracle: "0x1cad2202F3c916209D7cF54c9E0Fef67e75b3997",
        LiquidationEngine: "0xc34E4E65023613f7b841E08b10eBDCC33EAcE541",
        UPIBridge: "0x988708C9aBaE80Ece464ad573DBc0b78F1981A4e",
        AscendFactory: ascendFactoryAddress,
        MockERC20: mockERC20Address
      }
    };

    const fs = await import('fs');
    fs.writeFileSync('deployment-sepolia-complete.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("\n💾 Complete deployment info saved to deployment-sepolia-complete.json");

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
