const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const { ethers } = require("hardhat");

// Get the contract address from environment or use a default
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

async function main() {
  if (!CONTRACT_ADDRESS) {
    console.error("Please set the CONTRACT_ADDRESS environment variable");
    console.error("Example: export CONTRACT_ADDRESS=0x123...");
    process.exit(1);
  }

  console.log(`Listening for events on network: ${hre.network.name}`);
  console.log(`Contract address: ${CONTRACT_ADDRESS}`);
  
  try {
    // Get the contract factory and attach to the deployed address
    const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
    const simpleStorage = await SimpleStorage.attach(CONTRACT_ADDRESS);
    
    console.log("Connected to the contract. Listening for ValueChanged events...");
    
    // Set up event listener
    simpleStorage.on("ValueChanged", (newValue) => {
      console.log(`[${new Date().toISOString()}] Event: ValueChanged`);
      console.log(`New value: ${newValue}`);
      console.log('-----------------------------------');
    });
    
    console.log("Listening for events. Press Ctrl+C to exit.");
    
    // To help with testing, you can trigger an event by setting a value
    const shouldTriggerEvent = process.env.TRIGGER_EVENT === "true";
    if (shouldTriggerEvent) {
      console.log("\nTriggering a ValueChanged event for testing...");
      const timestamp = Math.floor(Date.now() / 1000);
      await simpleStorage.setValue(timestamp);
      console.log(`Set value to: ${timestamp}`);
    }
    
    // Keep the script running to continue listening for events
    await new Promise(() => {});
  } catch (error) {
    console.error("Error setting up event listener:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 