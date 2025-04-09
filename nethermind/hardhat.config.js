require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Helper function to get accounts based on environment
function getAccounts() {
  if (process.env.PRIVATE_KEY) {
    return [process.env.PRIVATE_KEY];
  } else if (process.env.MNEMONIC) {
    return {
      mnemonic: process.env.MNEMONIC
    };
  }
  return [];
}

module.exports = {
  solidity: "0.8.19",
  networks: {
    local: {
      url: "http://localhost:8545",
      chainId: 1337,
    },
    // Configuration for connecting to your Kubernetes-deployed Ethereum node via port-forwarding
    // Make sure to run the port-forward.sh script first
    gcp: {
      url: process.env.SEPOLIA_RPC_URL || "http://localhost:8545",
      chainId: parseInt(process.env.SEPOLIA_CHAIN_ID) || 11155111,
      accounts: getAccounts(),
      timeout: 60000,
    }
  }
}; 