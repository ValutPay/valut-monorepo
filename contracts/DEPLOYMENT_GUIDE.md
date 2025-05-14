# ValutContract Deployment Guide

This guide provides instructions for testing and deploying the ValutContract using Foundry.

## Prerequisites

1. Foundry installed (see main README.md for installation instructions)
2. Environment variables set up (copy `.env.example` to `.env` and fill in the values)

## Testing

The test script in `test/ValutContract.t.sol` contains comprehensive tests for the ValutContract, including:
- Initial state validation
- Token withdrawal functionality
- Permission checks
- ValutOfframp address updates
- Upgrade functionality

Run tests with:

```shell
$ forge test -vvv
```

Add `-vvv` for verbose output including logs. Use `-m testFunctionName` to run a specific test.

## Deployment

There are three deployment scripts available:

### 1. Initial Deployment

The `DeployValutContract` script deploys both the implementation contract and the proxy.

Required environment variables:
- `PRIVATE_KEY`: Your deployer account's private key
- `VALUT_OFFRAMP_ADDRESS`: The address of the ValutOfframp contract
- `RPC_URL`: The RPC URL for the target network

```shell
$ forge script script/Deploy.s.sol:DeployValutContract --rpc-url $RPC_URL --broadcast --verify
```

### 2. Contract Upgrade

The `UpgradeValutContract` script deploys a new implementation and upgrades the proxy.

Required environment variables:
- `PRIVATE_KEY`: Your deployer account's private key
- `PROXY_ADDRESS`: The address of the previously deployed proxy
- `RPC_URL`: The RPC URL for the target network

```shell
$ forge script script/Deploy.s.sol:UpgradeValutContract --rpc-url $RPC_URL --broadcast --verify
```

### 3. Update ValutOfframp Address

The `UpdateValutOfframpAddress` script updates the ValutOfframp address in the contract.

Required environment variables:
- `PRIVATE_KEY`: Your deployer account's private key
- `PROXY_ADDRESS`: The address of the deployed proxy
- `NEW_VALUT_OFFRAMP_ADDRESS`: The new ValutOfframp address
- `RPC_URL`: The RPC URL for the target network

```shell
$ forge script script/Deploy.s.sol:UpdateValutOfframpAddress --rpc-url $RPC_URL --broadcast
```

## Contract Verification

Add the `--verify` flag to your deployment commands to automatically verify the contract on Etherscan (requires `ETHERSCAN_API_KEY` in your `.env`).

For manual verification:
```shell
$ forge verify-contract <deployed_contract_address> src/ValutContract.sol:ValutContract --chain <chain_id> --watch
```

## Environment Variables

See `.env.example` for all required and optional environment variables.
