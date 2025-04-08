# Getting Started with Wallets and Gas on Sepolia Testnet

This guide provides comprehensive instructions for setting up a wallet and obtaining ETH for gas fees on the Sepolia testnet. This is essential for testing your smart contracts without spending real ETH.

## Table of Contents

1. [Understanding Wallets and Gas](#understanding-wallets-and-gas)
2. [Using Your Hardhat Wallet](#using-your-hardhat-wallet)
3. [Creating a MetaMask Wallet](#creating-a-metamask-wallet)
4. [Obtaining Sepolia ETH (Test ETH)](#obtaining-sepolia-eth-test-eth)
5. [Transferring ETH Between Wallets](#transferring-eth-between-wallets)
6. [Checking Balances](#checking-balances)
7. [Troubleshooting](#troubleshooting)

## Understanding Wallets and Gas

### What is a Wallet?

A cryptocurrency wallet is a digital tool that allows you to:
- Store your Ethereum address (public key)
- Manage your private keys (used to sign transactions)
- View your balance
- Send and receive ETH and tokens
- Interact with smart contracts

### What is Gas?

Gas is the fee required to perform transactions on the Ethereum network:
- All transactions (transfers, contract deployments, contract calls) require gas
- Gas is paid in ETH
- Gas price is measured in "gwei" (1 gwei = 0.000000001 ETH)
- Gas fees go to miners/validators who process transactions

### Testnet vs. Mainnet

- **Sepolia Testnet**: A test network where ETH has no real value, used for testing
- **Ethereum Mainnet**: The main Ethereum blockchain where ETH has real monetary value

## Using Your Hardhat Wallet

Hardhat, the development environment we use in this project, automatically creates wallets for testing.

### Viewing Your Hardhat Wallet Addresses

```bash
# Make sure you're in the project directory
cd nethermind

# Run the script to view your wallet addresses
npx hardhat run scripts/print-address.js --network gcp
```

This will show you:
- Your Hardhat wallet addresses
- The current balance of each address (if connected to the network)

### Hardhat Wallet Location

Hardhat creates wallets using a mnemonic phrase stored in your `hardhat.config.js` file:

```javascript
accounts: {
  mnemonic: "test test test test test test test test test test test junk",
},
```

From this mnemonic, Hardhat derives multiple wallet addresses.

## Creating a MetaMask Wallet

While you can use the Hardhat wallet for development, it's often easier to use MetaMask for testing.

### Installing MetaMask

1. Go to [metamask.io](https://metamask.io/)
2. Click "Download" and select your browser
3. Follow the installation instructions

### Creating a New Wallet

1. Click "Create a new wallet"
2. Create a password
3. Write down your secret recovery phrase (12-word mnemonic) and store it safely
   - **IMPORTANT**: Never share this phrase with anyone
   - Anyone with this phrase can access all your ETH and tokens
4. Verify your recovery phrase

### Connecting to Sepolia Testnet

1. Click the network dropdown at the top of MetaMask (it may say "Ethereum Mainnet")
2. Select "Sepolia Test Network"
   - If not visible, go to Settings > Advanced > Show test networks (toggle on)

### Getting Your Address

Your Ethereum address is shown at the top of the MetaMask interface. You can:
- Click on it to copy to clipboard
- Use this address with faucets to get test ETH

## Obtaining Sepolia ETH (Test ETH)

There are several ways to get test ETH for the Sepolia network:

### Option 1: Use the Fund-Account Script

If your Nethermind nodes have ETH, you can transfer it to your Hardhat wallet:

```bash
# First terminal: start port forwarding
./scripts/port-forward.sh

# Second terminal: run the funding script
node scripts/fund-account.js
```

### Option 2: Sepolia Faucets

Faucets are services that give away small amounts of test ETH:

1. **Google Cloud Web3 Faucet**:
   - Visit [Google Cloud Web3 Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia)
   - Sign in with your Google Cloud account
   - Enter your Ethereum address
   - Request test ETH

## Transferring ETH Between Wallets

### From MetaMask to Hardhat Wallet

1. Open MetaMask
2. Click "Send"
3. Enter your Hardhat wallet address (from `npx hardhat run scripts/print-address.js`)
4. Enter the amount of ETH to send
5. Click "Next" and confirm the transaction

### From Hardhat to Another Wallet

```bash
# Create a transfer script or use your smart contract code
npx hardhat run scripts/transfer-eth.js --network gcp
```

## Checking Balances

### Checking Hardhat Wallet Balance

```bash
# Check balance of your Hardhat wallet
npx hardhat run scripts/check-balance.js --network gcp
```

### Checking Any Address Balance

```bash
# Check balance of any address
./scripts/kubectl-rpc.sh balance 0xYOUR_ADDRESS_HERE
```

### Using Block Explorers

You can also check balances and transaction history using Sepolia block explorers:

1. Go to [sepolia.etherscan.io](https://sepolia.etherscan.io/)
2. Enter your Ethereum address in the search bar
3. View balance, transactions, and contract interactions

## Troubleshooting

### Not Receiving ETH from Faucets

1. **Faucet Limitations**:
   - Most faucets have request limits (e.g., once per day or week)
   - Try different faucets
   - Wait 24 hours before trying again

2. **Transaction Confirmation**:
   - Transactions may take time to confirm
   - Check the transaction status on Sepolia Etherscan

### "Insufficient Funds" Errors

If you see "Insufficient Funds" when trying to send transactions:

1. Make sure you have enough ETH for gas:
   - Contract deployment: Usually needs 0.01-0.1 ETH
   - Contract interaction: Usually needs 0.001-0.01 ETH

2. Check your current balance:
   ```bash
   npx hardhat run scripts/check-balance.js --network gcp
   ```

3. Reduce gas price if possible:
   - In Hardhat, configure gasPrice in your hardhat.config.js
   - In MetaMask, use "Low" gas price setting

### Private Key Management

1. **Security Best Practices**:
   - Never share your private key or mnemonic phrase
   - Don't commit private keys to Git repositories
   - Use environment variables or .env files for private keys

2. **Lost Private Keys**:
   - If using MetaMask, you can restore with your 12-word mnemonic
   - For Hardhat, the mnemonic is in hardhat.config.js

## Next Steps

Once you have ETH for gas, you're ready to deploy and test your smart contracts. Follow the instructions in the [GCP_TESTING_GUIDE.md](GCP_TESTING_GUIDE.md) for deploying contracts to your Sepolia testnet. 