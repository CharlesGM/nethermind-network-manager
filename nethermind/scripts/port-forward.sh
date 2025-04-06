#!/bin/bash

# Exit on error
set -e

NAMESPACE="nethermind"
SERVICE="nethermind-miner"
LOCAL_PORT=8545
REMOTE_PORT=8545

echo "Setting up port-forwarding to Nethermind node in $NAMESPACE namespace"
echo "Local port: $LOCAL_PORT -> Service port: $REMOTE_PORT"
echo ""
echo "This will create a tunnel to your Kubernetes cluster."
echo "Leave this terminal window open while testing."
echo "Press Ctrl+C to stop the port forwarding when done."
echo ""

# Start port forwarding
kubectl port-forward -n $NAMESPACE svc/$SERVICE $LOCAL_PORT:$REMOTE_PORT

# This script will keep running until terminated with Ctrl+C 