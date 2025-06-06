const hre = require("hardhat");

async function main() {
  try {
    console.log("Starting deployment...");
    
    // Get the signer
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    
    // Get the current nonce
    const nonce = await deployer.getNonce();
    console.log("Current nonce:", nonce);
    
    // Deploy the contract with a unique salt
    console.log("Deploying SimpleStorage...");
    const SimpleStorage = await hre.ethers.getContractFactory("SimpleStorage");
    
    // Add a unique salt to the deployment
    const salt = Date.now().toString();
    const simpleStorage = await SimpleStorage.deploy({
      nonce: nonce,
      gasLimit: 5000000, // Increase gas limit
      gasPrice: await hre.ethers.provider.getGasPrice()
    });
    
    console.log("Waiting for deployment confirmation...");
    const deploymentReceipt = await simpleStorage.waitForDeployment();
    console.log("Deployment receipt:", deploymentReceipt);
    
    const address = await simpleStorage.getAddress();
    console.log("SimpleStorage deployed to:", address);
    
    // Verify the deployment
    console.log("Verifying deployment...");
    const code = await hre.ethers.provider.getCode(address);
    if (code === "0x") {
      throw new Error("Contract deployment failed - no code at address");
    }
    console.log("Deployment verified successfully!");
    
  } catch (error) {
    console.error("Deployment failed:", error);
    if (error.message.includes("AlreadyKnown")) {
      console.log("This contract might already be deployed. Check your network explorer for recent transactions.");
      console.log("Try resetting your MetaMask account and waiting a few minutes before trying again.");
    }
    process.exit(1);
  }
}

main(); 