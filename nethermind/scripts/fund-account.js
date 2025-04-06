const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to execute kubectl-rpc.sh with the given method and params
function rpcCall(method, params = '[]') {
  try {
    const command = `./scripts/kubectl-rpc.sh custom ${method} '${params}'`;
    const output = execSync(command, { encoding: 'utf8' });
    
    // Extract the JSON response from the output
    const jsonStartIndex = output.indexOf('{');
    const jsonEndIndex = output.lastIndexOf('}');
    
    if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
      const jsonStr = output.substring(jsonStartIndex, jsonEndIndex + 1);
      return JSON.parse(jsonStr);
    }
    
    console.error('Could not parse JSON from output:', output);
    return null;
  } catch (error) {
    console.error(`Error executing RPC call: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log("This script will help fund your Hardhat account from a Nethermind miner account\n");
  
  // Read the hardhat config to get the account to fund
  let hardhatConfig;
  try {
    const configPath = path.join(__dirname, '../hardhat.config.js');
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    // Extract the mnemonic using a regex (this is not a full JS parser but works for simple cases)
    const mnemonicMatch = configContent.match(/mnemonic:\s*["']([^"']+)["']/);
    
    if (!mnemonicMatch) {
      console.error("Could not find mnemonic in hardhat.config.js");
      return;
    }
    
    const mnemonic = mnemonicMatch[1];
    console.log(`Found mnemonic in hardhat.config.js: ${mnemonic}`);
    
    // Use ethers to derive the address from the mnemonic
    // This is a simplified approach and assumes the default HD path
    const { ethers } = require('ethers');
    const wallet = ethers.Wallet.fromMnemonic(mnemonic);
    const addressToFund = wallet.address;
    
    console.log(`\nAddress to fund: ${addressToFund}`);
    
    // Check current balance
    console.log("\nChecking current balance...");
    const balanceResponse = rpcCall('eth_getBalance', `["${addressToFund}", "latest"]`);
    
    if (balanceResponse && balanceResponse.result) {
      const balanceHex = balanceResponse.result;
      const balanceWei = parseInt(balanceHex, 16);
      const balanceEth = balanceWei / 1e18;
      console.log(`Current balance: ${balanceEth} ETH`);
      
      if (balanceEth > 0) {
        console.log("\nAccount already has funds. No need to send more ETH.");
        return;
      }
    }
    
    // Get accounts from the node to find one with funds
    console.log("\nLooking for a funded account on the node...");
    const accountsResponse = rpcCall('eth_accounts');
    
    if (!accountsResponse || !accountsResponse.result || accountsResponse.result.length === 0) {
      console.error("No accounts found on the node.");
      return;
    }
    
    // Find an account with funds
    let fundedAccount = null;
    let fundedAccountBalance = 0;
    
    for (const account of accountsResponse.result) {
      const balResponse = rpcCall('eth_getBalance', `["${account}", "latest"]`);
      if (balResponse && balResponse.result) {
        const balWei = parseInt(balResponse.result, 16);
        console.log(`Account ${account} has ${balWei / 1e18} ETH`);
        
        if (balWei > 0 && balWei > fundedAccountBalance) {
          fundedAccount = account;
          fundedAccountBalance = balWei;
        }
      }
    }
    
    if (!fundedAccount) {
      console.error("\nNo funded accounts found on the node.");
      console.log("You have a few options:");
      console.log("1. Update your Nethermind deployment to include a pre-funded account");
      console.log("2. Get Goerli ETH from a faucet (https://goerlifaucet.com/)");
      console.log("3. Use an existing Goerli account by updating hardhat.config.js");
      return;
    }
    
    console.log(`\nFound funded account: ${fundedAccount} with ${fundedAccountBalance / 1e18} ETH`);
    console.log(`Sending 1 ETH to ${addressToFund}...`);
    
    // Send 1 ETH to the address
    const txParams = JSON.stringify({
      from: fundedAccount,
      to: addressToFund,
      value: "0xDE0B6B3A7640000", // 1 ETH in hex
      gas: "0x5208" // 21000 gas
    });
    
    const sendResponse = rpcCall('eth_sendTransaction', `[${txParams}]`);
    
    if (!sendResponse || !sendResponse.result) {
      console.error("Failed to send transaction");
      console.error(sendResponse);
      return;
    }
    
    const txHash = sendResponse.result;
    console.log(`Transaction sent with hash: ${txHash}`);
    console.log("Waiting for transaction to be mined...");
    
    // Wait for transaction to be mined
    let receipt = null;
    let attempts = 0;
    const maxAttempts = 30;
    
    while (!receipt && attempts < maxAttempts) {
      attempts++;
      
      const receiptResponse = rpcCall('eth_getTransactionReceipt', `["${txHash}"]`);
      
      if (receiptResponse && receiptResponse.result) {
        receipt = receiptResponse.result;
        console.log("Transaction confirmed!");
        console.log(`Block number: ${parseInt(receipt.blockNumber, 16)}`);
        
        // Check new balance
        const newBalanceResponse = rpcCall('eth_getBalance', `["${addressToFund}", "latest"]`);
        if (newBalanceResponse && newBalanceResponse.result) {
          const newBalanceWei = parseInt(newBalanceResponse.result, 16);
          const newBalanceEth = newBalanceWei / 1e18;
          console.log(`\nNew balance: ${newBalanceEth} ETH`);
        }
        
        console.log("\nYou can now deploy contracts using your funded account!");
        console.log("Run: npx hardhat run scripts/deploy.js --network gcp");
      } else {
        console.log(`Waiting for transaction to be mined (attempt ${attempts}/${maxAttempts})...`);
        // Sleep for 2 seconds before checking again
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    if (!receipt) {
      console.error("\nTransaction was not mined within the expected time");
      console.log("Check the transaction status manually using the hash:", txHash);
    }
    
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main().catch(console.error); 