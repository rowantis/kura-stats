# Kura Stats Dashboard

A dashboard that displays DEX transaction history. Fetches and displays Swap, Mint, and Burn transaction data through GraphQL API.

## 🏗️ Project Structure

This project is configured using Turborepo:

```
kura-stats/
├── stats-frontend/     # Next.js frontend application
├── lib/               # Shared libraries (v3-sdk, etc.)
├── turbo.json         # Turborepo configuration
├── pnpm-workspace.yaml # pnpm workspace configuration
└── package.json       # Root package configuration
```

## 🚀 Key Features

- **Transaction History Display**: Unified interface for Swap, Mint, and Burn transactions
- **Filtering**: Address, transaction type, token, pool type, and date range filtering
- **Tab Separation**: Separate tabs for Swap and Liquidity (Mint/Burn) transactions
- **Pagination**: Page-by-page display starting from recent transactions
- **CSV Download**: Download current transaction data as CSV
- **Copy Functionality**: Copy addresses to clipboard

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **GraphQL**: Apollo Client
- **Package Management**: pnpm
- **Monorepo**: Turborepo

## 📦 Installation & Execution

### Full Project Execution

```bash
# Install dependencies (run once to install for all workspaces)
pnpm install

# Run all workspaces in development mode
pnpm dev

# Run only frontend in development mode
pnpm frontend:dev

# Build
pnpm build
```

### Frontend Only Execution

```bash
cd stats-frontend
pnpm install
pnpm dev
```

## 🔧 Environment Configuration

Set the GraphQL endpoint in the `.env` file at the project root:

```env
NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://your-graphql-endpoint.com/graphql
```

## 📊 GraphQL Queries

The project uses the following GraphQL query:

```graphql
query MyQuery {
  clSwaps {
    amount0 amount1 amountUSD origin
    pool { feeTier }
    token0 { symbol id }
    token1 { symbol id }
    transaction { id timestamp }
  }
  clMints { ... }
  clBurns { ... }
  legacySwaps { ... }
  legacyMints { ... }
  legacyBurns { ... }
}
```

## 🎯 Data Transformation

Integrates GraphQL responses as follows:

- **CL Transactions**: `CLSwap`, `CLMint`, `CLBurn`
- **Legacy Transactions**: `LegacySwap`, `LegacyMint`, `LegacyBurn`
- **Unified Types**: `SwapTransaction`, `LiquidityTransaction`

## 🔗 External Links

- **Token Information**: `https://seitrace.com/address/${tokenAddress}?chain=pacific-1`
- **Transaction Information**: `https://seitrace.com/tx/${transaction.id}?chain=pacific-1`

## 📝 Development Guide

### Adding New Workspaces

```bash
# Add new package in lib directory
mkdir lib/new-package
cd lib/new-package
pnpm init

# Register workspace at root, then
pnpm install
```

### Turborepo Commands

```bash
# Run only specific workspace
pnpm run dev --filter=stats-frontend

# Check dependency graph
pnpm turbo graph

# Clear cache
pnpm turbo clean
```

### Workspace Management

```bash
# Install dependencies for all workspaces
pnpm install

# Install only specific workspace
pnpm install --filter=stats-frontend

# Check workspace list
pnpm list -r
```
