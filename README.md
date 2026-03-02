# Jump To Explorer

`Jump To Explorer` is a tiny static site that turns a hash route into a block explorer redirect.

It uses the chain definitions from `viem` and resolves the default explorer URL for the requested chain ID, then redirects the browser to the matching transaction, address, or token page.

This makes it useful as a lightweight universal redirect endpoint for wallets, tools, docs, QR codes, or browser shortcuts.

## Route Format

The app reads the URL hash in this format:

```text
#/chain/<chain>/<resource>/<id>
```

Primary resource types:

- `tx`
- `address`
- `token`
- `block`

Supported aliases:

- `transaction` / `transactions` -> `tx`
- `account` / `wallet` / `contract` -> `address`
- `erc20` -> `token`
- `blocks` -> `block`

Supported chain formats:

- Decimal chain ID, such as `1`
- Hex chain ID, such as `0x1`

## Examples

Ethereum address:

```text
https://jte.limaois.me/#/chain/1/address/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
```

This redirects to:

```text
https://etherscan.com/address/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
```

Ethereum transaction:

```text
https://jte.limaois.me/#/chain/1/tx/0x...
```

Ethereum block:

```text
https://jte.limaois.me/#/chain/1/block/19452299
```

Optimism token:

```text
https://jte.limaois.me/#/chain/10/token/0x...
```

## How It Works

- The Vite build reads `viem` chain definitions at build time.
- A compact `chainId -> explorer base URL` map is generated and bundled into the client.
- At runtime, the page parses the hash route and redirects with `window.location.replace(...)`.

Because only the explorer URL map is shipped to the browser, the final payload is smaller than bundling the full `viem/chains` export directly into the client.

## Development

Install dependencies:

```bash
pnpm install
```

Run the dev server:

```bash
pnpm dev
```

Build the static site:

```bash
pnpm build
```

Preview the production build:

```bash
pnpm preview
```

## Deployment

This repo includes a GitHub Pages workflow at `.github/workflows/deploy.yml`.

When you push to the `main` branch, GitHub Actions will:

- install dependencies
- run the Vite build
- upload the `dist/` folder
- deploy it to GitHub Pages

## Notes

- The redirect target uses the default explorer defined in `viem` for that chain.
- Resource aliases are normalized before redirecting, so `account` and `wallet` behave the same as `address`.
- If a chain is missing from `viem`, the page shows an error instead of redirecting.
- The app is fully static and does not require a backend.
