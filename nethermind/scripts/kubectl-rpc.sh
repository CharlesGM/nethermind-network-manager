#!/bin/bash

# Exit on error
set -e

NAMESPACE="nethermind"

# Get the first miner pod
POD_NAME=$(kubectl get pods -n $NAMESPACE -l app=nethermind,component=miner -o jsonpath='{.items[0].metadata.name}')

if [ -z "$POD_NAME" ]; then
  echo "Error: Could not find Nethermind miner pod in namespace $NAMESPACE"
  exit 1
fi

echo "Found Nethermind miner pod: $POD_NAME"

# Function to send RPC request
send_rpc_request() {
  local method=$1
  local params=$2
  
  # Default params to empty array if not provided
  if [ -z "$params" ]; then
    params="[]"
  fi
  
  local request="{\"jsonrpc\":\"2.0\",\"method\":\"$method\",\"params\":$params,\"id\":1}"
  
  echo "Sending RPC request: $request"
  kubectl exec -n $NAMESPACE $POD_NAME -- curl -s -X POST -H "Content-Type: application/json" --data "$request" http://localhost:8545
  echo ""
}

# Check command line arguments
if [ $# -eq 0 ]; then
  echo "Usage: $0 <command> [params]"
  echo ""
  echo "Available commands:"
  echo "  block         - Get latest block number"
  echo "  accounts      - Get accounts"
  echo "  balance <address> - Get account balance"
  echo "  custom <method> <params> - Send custom RPC request"
  echo ""
  echo "Examples:"
  echo "  $0 block"
  echo "  $0 balance 0x1234567890123456789012345678901234567890"
  echo "  $0 custom eth_gasPrice []"
  exit 0
fi

COMMAND=$1

case $COMMAND in
  block)
    echo "Getting latest block number..."
    send_rpc_request "eth_blockNumber"
    ;;
  accounts)
    echo "Getting accounts..."
    send_rpc_request "eth_accounts"
    ;;
  balance)
    if [ -z "$2" ]; then
      echo "Error: Address is required for balance command"
      echo "Usage: $0 balance <address>"
      exit 1
    fi
    echo "Getting balance for address $2..."
    send_rpc_request "eth_getBalance" "[\"$2\", \"latest\"]"
    ;;
  custom)
    if [ -z "$2" ] || [ -z "$3" ]; then
      echo "Error: Method and params are required for custom command"
      echo "Usage: $0 custom <method> <params>"
      exit 1
    fi
    echo "Sending custom RPC request..."
    send_rpc_request "$2" "$3"
    ;;
  *)
    echo "Unknown command: $COMMAND"
    echo "Run $0 without arguments to see usage information"
    exit 1
    ;;
esac 