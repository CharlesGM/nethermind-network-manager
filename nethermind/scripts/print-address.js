const { ethers } = require("hardhat");

async function main() {
  // Get all signers
  const accounts = await ethers.getSigners();
  
  console.log("\nHardhat Wallet Addresses:\n");
  
  // Print each account address
  for (let i = 0; i < accounts.length; i++) {
    const address = await accounts[i].getAddress();
    console.log(`Account ${i}: ${address}`);
    
    // Check balance if connected to a network
    try {
      const balance = await ethers.provider.getBalance(address);
      const etherBalance = ethers.formatEther(balance);
      console.log(`Balance: ${etherBalance} ETH`);
    } catch (error) {
      console.log("Could not fetch balance");
    }
    
    console.log(""); // Empty line for readability
  }
  
  console.log("To get ETH for any of these addresses:");
  console.log("1. Visit a Goerli faucet like https://goerlifaucet.com/");
  console.log("2. Enter the address");
  console.log("3. Receive test ETH\n");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 