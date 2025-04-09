# Wallet Guide for Sepolia Testnet

This guide helps you set up wallets and get test ETH on the Sepolia testnet.

## Setting Up MetaMask

1. Install [MetaMask](https://metamask.io/)
2. Create a new wallet
3. Connect to Sepolia:
   - Click network dropdown
   - Select "Sepolia Test Network"
   - If not visible: Settings > Advanced > Show test networks

## Getting Test ETH

1. Visit [Google Cloud Web3 Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia)
2. Sign in with your Google Cloud account
3. Enter your MetaMask address
4. Request test ETH

## Using Hardhat Wallet

Your Hardhat configuration in `hardhat.config.js` can use either:

1. **MetaMask Private Key**:
```javascript
accounts: [
  "YOUR_PRIVATE_KEY_HERE" // From MetaMask
]
```

2. **Test Mnemonic**:
```javascript
accounts: {
  mnemonic: "test test test test test test test test test test test junk"
}
```

## Checking Balances

```bash
# Check Hardhat wallet balance
npx hardhat run scripts/check-balance.js --network gcp

# Check any address
./scripts/kubectl-rpc.sh balance 0xYOUR_ADDRESS
```

## Troubleshooting

1. **No ETH in Wallet**
   - Use the Google Cloud faucet
   - Wait for transaction confirmation
   - Check balance on [Sepolia Etherscan](https://sepolia.etherscan.io/)

2. **Transaction Failed**
   - Ensure enough ETH for gas
   - Check network is Sepolia
   - Verify port-forwarding is active

3. **Chain ID Mismatch**
   - MetaMask: Switch to Sepolia
   - Hardhat: Use chainId: 11155111 