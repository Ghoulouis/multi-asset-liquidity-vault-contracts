# Multi Asset Liquidity Vault Contracts

## Description

This project is a **Multi Asset Liquidity Vault** built on the Solana blockchain that allows users to:

- **Deposit multiple token types**: Users can deposit different types of tokens into the vault
- **Receive LP tokens based on USD value**: When depositing tokens, users receive LP (Liquidity Provider) tokens corresponding to the USD value of the deposited tokens
- **Burn LP to withdraw tokens**: Users can burn LP tokens to withdraw one of the token types available in the vault

This is a learning project aimed at understanding and practicing smart contract development on Solana using the Anchor framework.

## Tech Stack

- **Framework**: [Anchor](https://www.anchor-lang.com/) v0.31.0
- **Language**: Rust (for smart contracts)
- **Testing**:
  - [solana-bankrun](https://github.com/anza-xyz/solana-bankrun) - Testing framework for Solana programs
  - TypeScript/Node.js for test scripts
- **Token Standard**: SPL Token
- **Metadata**: Metaplex Token Metadata (optional)

## Project Structure

```
vault-contracts-2/
├── programs/
│   └── vault-contracts/
│       └── src/
│           ├── lib.rs                          # Program entry point
│           ├── state/
│           │   ├── mod.rs
│           │   └── vault.rs                    # Vault state structure
│           └── instructions/
│               ├── mod.rs
│               ├── initialize_vault_with_metadata.rs    # Initialize with metadata
│               └── initialize_vault_without_metadata.rs # Initialize without metadata
├── tests/
│   ├── initializeWithMetadata.ts               # Test initialize with metadata
│   ├── initializeWithoutMetadata.ts            # Test initialize without metadata
│   └── bankrun-utils/
│       ├── common.ts                           # Test utilities
│       └── constants.ts                        # Constants
├── migrations/
│   └── deploy.ts                               # Deployment script
├── Anchor.toml                                  # Anchor configuration
└── Cargo.toml                                  # Rust dependencies
```

## Current Features

### ✅ Implemented

1. **Initialize Vault**
   - Initialize vault with or without metadata for LP token
   - Create LP mint with vault as authority
   - Store vault state information on-chain

### 🚧 In Development

1. **Deposit Tokens**

   - Allow depositing multiple token types into vault
   - Calculate and mint LP tokens based on USD value

2. **Withdraw Tokens**

   - Burn LP tokens to withdraw tokens from vault
   - Support withdrawing a specific token type

3. **Price Oracle Integration**
   - Integrate price oracle to calculate USD value of tokens

## Installation

### Requirements

- [Rust](https://www.rust-lang.org/tools/install) (latest stable)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools) (latest)
- [Anchor](https://www.anchor-lang.com/docs/installation) v0.31.0
- [Node.js](https://nodejs.org/) and [Yarn](https://yarnpkg.com/)

### Development

Install dependencies:

```bash
yarn install
```

Build program:

```bash
anchor build
```

Run tests:

```bash
anchor test
```
