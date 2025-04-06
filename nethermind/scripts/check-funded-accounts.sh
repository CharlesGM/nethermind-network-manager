#!/bin/bash

# Exit on error
set -e

echo "Checking for accounts with ETH balance in your Nethermind network..."
echo ""

# Get the list of accounts
accounts=$(./scripts/kubectl-rpc.sh accounts | grep -o '0x[a-fA-F0-9]\+' | tr -d '[],"')

# Check balance for each account
for account in $accounts; do
  echo "Checking balance for $account"
  balance_hex=$(./scripts/kubectl-rpc.sh custom eth_getBalance "[\"$account\", \"latest\"]" | grep -o '0x[a-fA-F0-9]\+' | tr -d '[],"')
  
  if [ ! -z "$balance_hex" ]; then
    # Convert hex to decimal (this is a simple conversion and might not work for very large numbers)
    balance_dec=$(printf "%d" $balance_hex 2>/dev/null)
    
    if [ $? -eq 0 ] && [ $balance_dec -gt 0 ]; then
      # Convert to ETH (divide by 10^18)
      balance_eth=$(echo "scale=18; $balance_dec / 1000000000000000000" | bc)
      echo "Found account with balance: $account"
      echo "Balance: $balance_eth ETH"
      echo ""
      echo "To use this account, update hardhat.config.js with:"
      echo "accounts: ["
      echo "  \"$account\"  // Pre-funded account with $balance_eth ETH"
      echo "]"
      echo ""
      echo "Or you can use it with direct-deploy.js directly"
      echo ""
    fi
  fi
done

echo "If no accounts with balance were found, you need to:"
echo "1. Get Goerli ETH from a faucet (see instructions in script)"
echo "2. Or create a funded account on your Nethermind node" 