const { ethers } = require("hardhat");

async function main() {
  // Get the signer (wallet)
  const [signer] = await ethers.getSigners();
  
  // Get destination address from environment variable or use a default
  const toAddress = process.env.TO_ADDRESS;
  
  // Check if TO_ADDRESS is provided
  if (!toAddress) {
    console.error("Error: TO_ADDRESS environment variable is required");
    console.error("Usage: TO_ADDRESS=0x... AMOUNT=0.1 npx hardhat run scripts/transfer-eth.js --network gcp");
    process.exit(1);
  }
  
  // Get amount from environment variable or use default (0.01 ETH)
  const amountEth = process.env.AMOUNT || "0.01";
  // Convert to wei (1 ETH = 10^18 wei)
  const amountWei = ethers.parseEther(amountEth);
  
  // Check sender balance
  const balance = await ethers.provider.getBalance(signer.address);
  const balanceEth = ethers.formatEther(balance);
  
  console.log(`Sender address: ${signer.address}`);
  console.log(`Sender balance: ${balanceEth} ETH`);
  console.log(`Recipient address: ${toAddress}`);
  console.log(`Amount to send: ${amountEth} ETH`);
  
  // Check if there's enough balance
  if (balance < amountWei) {
    console.error(`Error: Insufficient balance. You have ${balanceEth} ETH but tried to send ${amountEth} ETH`);
    process.exit(1);
  }
  
  console.log("\nSending transaction...");
  
  // Send transaction
  const tx = await signer.sendTransaction({
    to: toAddress,
    value: amountWei
  });
  
  console.log(`Transaction hash: ${tx.hash}`);
  console.log("Waiting for confirmation...");
  
  // Wait for the transaction to be mined
  const receipt = await tx.wait();
  
  console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
  
  // Get updated balances
  const newBalance = await ethers.provider.getBalance(signer.address);
  const newBalanceEth = ethers.formatEther(newBalance);
  
  const recipientBalance = await ethers.provider.getBalance(toAddress);
  const recipientBalanceEth = ethers.formatEther(recipientBalance);
  
  console.log(`\nSender's new balance: ${newBalanceEth} ETH`);
  console.log(`Recipient's new balance: ${recipientBalanceEth} ETH`);
  
  console.log("\nSuccessfully transferred ETH!");
  console.log(`You can view this transaction on Goerli Etherscan: https://goerli.etherscan.io/tx/${tx.hash}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 