require("@nomicfoundation/hardhat-toolbox");

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
      url: "http://localhost:8545", // Uses port-forwarding to connect to your Kubernetes service
      chainId: 11155111, // Updated to Sepolia testnet chain ID
      
      // OPTION 1: Use a mnemonic (this will likely have 0 ETH until funded from a faucet)
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
      },
      
      // OPTION 2: Use private keys directly (uncomment and replace with your funded private key)
      // accounts: [
      //   "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // Replace with a funded private key
      // ],
      
      // OPTION 3: Use a pre-funded account address from your Nethermind node
      // To find pre-funded accounts, run: ./scripts/check-funded-accounts.sh
      // Then uncomment below and add the address (requires direct-deploy.js approach)
      // from: "0x0000000000000000000000000000000000000000", // Replace with a funded account address
      
      timeout: 60000, // Increase timeout for stability
    }
  }
}; 