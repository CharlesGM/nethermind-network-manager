const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  try {
    console.log(`Checking balances on network: ${hre.network.name}`);

    // Get the list of accounts
    const accounts = await ethers.getSigners();
    
    // Display the balance of each account
    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i];
      const address = await account.getAddress();
      const balance = await ethers.provider.getBalance(address);
      
      // Convert balance from wei to ether for readability
      const etherBalance = ethers.formatEther(balance);
      
      console.log(`Account ${i}: ${address}`);
      console.log(`Balance: ${etherBalance} ETH`);
      console.log('-----------------------------------');
    }
    
    // If we have access to the default accounts on the node, check their balances too
    try {
      console.log("\nChecking balances of pre-defined accounts in the genesis block:");
      
      // Some common pre-funded accounts in dev networks
      const preDefinedAccounts = [
        "0x0000000000000000000000000000000000000000" // Zero address from your genesis config
      ];
      
      for (const address of preDefinedAccounts) {
        const balance = await ethers.provider.getBalance(address);
        const etherBalance = ethers.formatEther(balance);
        
        console.log(`Address: ${address}`);
        console.log(`Balance: ${etherBalance} ETH`);
        console.log('-----------------------------------');
      }
    } catch (error) {
      console.log("Could not check pre-defined account balances:", error.message);
    }
    
  } catch (error) {
    console.error("Error checking balances:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 