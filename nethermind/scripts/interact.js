const hre = require("hardhat");

async function main() {
  // Check if we're interacting with a deployed contract
  const contractAddress = process.env.CONTRACT_ADDRESS;
  let simpleStorage;
  
  if (contractAddress) {
    console.log(`Connecting to existing contract at ${contractAddress}`);
    const SimpleStorage = await hre.ethers.getContractFactory("SimpleStorage");
    simpleStorage = await SimpleStorage.attach(contractAddress);
  } else {
    // Deploy a new instance
    console.log("No CONTRACT_ADDRESS provided. Deploying a new contract...");
    const SimpleStorage = await hre.ethers.getContractFactory("SimpleStorage");
    simpleStorage = await SimpleStorage.deploy();
    await simpleStorage.waitForDeployment();
    
    const deployedAddress = await simpleStorage.getAddress();
    console.log(`SimpleStorage deployed to: ${deployedAddress}`);
  }
  
  // Get the current value
  let currentValue = await simpleStorage.getValue();
  console.log(`Current value: ${currentValue}`);
  
  // Set a new value
  const newValue = process.env.NEW_VALUE ? parseInt(process.env.NEW_VALUE) : 42;
  console.log(`Setting value to: ${newValue}`);
  const tx = await simpleStorage.setValue(newValue);
  console.log(`Transaction hash: ${tx.hash}`);
  console.log("Waiting for transaction to be mined...");
  await tx.wait(); // Wait for the transaction to be mined
  
  // Get the updated value
  currentValue = await simpleStorage.getValue();
  console.log(`Updated value: ${currentValue}`);
  
  if (!contractAddress) {
    // Only print this for newly deployed contracts
    console.log(`\nTo interact with this contract again, run:`);
    console.log(`export CONTRACT_ADDRESS=${await simpleStorage.getAddress()}`);
    console.log(`npx hardhat run scripts/interact.js --network <network-name>`);
  }
  
  console.log("Interaction complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 