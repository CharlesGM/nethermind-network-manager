const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Read the SimpleStorage contract ABI and bytecode
const contractPath = path.join(__dirname, '../artifacts/contracts/SimpleStorage.sol/SimpleStorage.json');

// Check if contract artifacts exist, if not, compile first
if (!fs.existsSync(contractPath)) {
  console.log('Contract artifacts not found. Compiling contracts first...');
  execSync('npx hardhat compile', { stdio: 'inherit' });
}

const contractData = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
const abi = contractData.abi;
const bytecode = contractData.bytecode;

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
  try {
    console.log('Deploying and interacting with contract via direct kubectl exec...\n');

    // Get accounts
    console.log('Fetching accounts...');
    const accountsResponse = rpcCall('eth_accounts');
    
    if (!accountsResponse || !accountsResponse.result || accountsResponse.result.length === 0) {
      console.error('No accounts found or RPC call failed');
      return;
    }
    
    const account = accountsResponse.result[0];
    console.log(`Using account: ${account}\n`);
    
    // Get account balance
    console.log('Checking account balance...');
    const balanceResponse = rpcCall('eth_getBalance', `["${account}", "latest"]`);
    
    if (balanceResponse && balanceResponse.result) {
      const balanceHex = balanceResponse.result;
      const balanceWei = parseInt(balanceHex, 16);
      const balanceEth = balanceWei / 1e18;
      console.log(`Account balance: ${balanceEth} ETH\n`);
    } else {
      console.log('Could not retrieve balance\n');
    }
    
    // Deploy contract
    console.log('Deploying SimpleStorage contract...');
    const deployParams = JSON.stringify([{
      from: account,
      data: bytecode,
      gas: '0x200000' // Adjust gas as needed
    }]);
    
    const deployResponse = rpcCall('eth_sendTransaction', deployParams);
    
    if (!deployResponse || !deployResponse.result) {
      console.error('Contract deployment failed or RPC call failed');
      return;
    }
    
    const txHash = deployResponse.result;
    console.log(`Transaction hash: ${txHash}`);
    
    // Wait for transaction receipt
    console.log('Waiting for transaction to be mined...');
    let receipt = null;
    let attempts = 0;
    const maxAttempts = 30;
    
    while (!receipt && attempts < maxAttempts) {
      attempts++;
      
      const receiptResponse = rpcCall('eth_getTransactionReceipt', `["${txHash}"]`);
      
      if (receiptResponse && receiptResponse.result) {
        receipt = receiptResponse.result;
      } else {
        console.log(`Waiting for transaction to be mined (attempt ${attempts}/${maxAttempts})...`);
        // Sleep for 2 seconds before checking again
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    if (!receipt) {
      console.error('Transaction was not mined within the expected time');
      return;
    }
    
    const contractAddress = receipt.contractAddress;
    console.log(`Contract deployed at address: ${contractAddress}\n`);
    
    // Interact with the contract: setValue
    console.log('Setting value to 42...');
    const setValue = '0x60fe47b1'; // Function selector for setValue(uint256)
    const value = '000000000000000000000000000000000000000000000000000000000000002a'; // 42 in hex
    const callData = setValue + value;
    
    const setValueParams = JSON.stringify([{
      from: account,
      to: contractAddress,
      data: callData,
      gas: '0x100000' // Adjust gas as needed
    }]);
    
    const setValueResponse = rpcCall('eth_sendTransaction', setValueParams);
    
    if (!setValueResponse || !setValueResponse.result) {
      console.error('setValue transaction failed or RPC call failed');
      return;
    }
    
    const setValueTxHash = setValueResponse.result;
    console.log(`setValue transaction hash: ${setValueTxHash}`);
    
    // Wait for setValue transaction to be mined
    console.log('Waiting for setValue transaction to be mined...');
    let setValueReceipt = null;
    attempts = 0;
    
    while (!setValueReceipt && attempts < maxAttempts) {
      attempts++;
      
      const receiptResponse = rpcCall('eth_getTransactionReceipt', `["${setValueTxHash}"]`);
      
      if (receiptResponse && receiptResponse.result) {
        setValueReceipt = receiptResponse.result;
      } else {
        console.log(`Waiting for setValue transaction to be mined (attempt ${attempts}/${maxAttempts})...`);
        // Sleep for 2 seconds before checking again
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    if (!setValueReceipt) {
      console.error('setValue transaction was not mined within the expected time');
      return;
    }
    
    console.log('setValue transaction mined successfully\n');
    
    // Call getValue
    console.log('Getting the current value...');
    const getValue = '0x20965255'; // Function selector for getValue()
    
    const getValueParams = JSON.stringify([{
      to: contractAddress,
      data: getValue
    }, 'latest']);
    
    const getValueResponse = rpcCall('eth_call', getValueParams);
    
    if (!getValueResponse || !getValueResponse.result) {
      console.error('getValue call failed or RPC call failed');
      return;
    }
    
    const hexValue = getValueResponse.result;
    const decimalValue = parseInt(hexValue, 16);
    console.log(`Current value: ${decimalValue}\n`);
    
    console.log('Direct contract interaction complete!');
    console.log(`Contract address for future reference: ${contractAddress}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
}); 