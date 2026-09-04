# Playground

This repository contains the source code for [https://playground.hello.dev/](https://playground.hello.dev/).

## Getting Started

### Prerequisites

1. **Git**
1. **Node.js** (version 18 or higher)
1. A fork of this repository (required for contributions)
1. A local clone of the [Playground repository](https://github.com/hellocoop/playground)
1. A Hellō account (Create one at [Hellō Wallet](https://wallet.hello.coop/))
1. A `client_id` for a Hellō application with `http://localhost:*` development redirect URI enabled (Create one at the [Hellō Developer Console](https://console.hello.coop/))

### Installation

1. Run `cd playground` to navigate to the project root
1. Run `npm i` to install the necessary npm dependencies

### Running Locally

1. Run `npm run dev` to start the hot-reloading development server (powered by [Vite](https://vitejs.dev/))
1. Open [http://localhost:5173](http://localhost:5173) in your preferred browser
1. Use your application's `client_id` and update the value in the **Protocol Parameters** section
1. Update the `redirect_uri` in the **Protocol Parameters** section to be `http://localhost:5173`

## License

This project is licensed under the [MIT License](LICENSE).

## Deployment

playground.hello.dev is served from Cloudflare Workers as static assets (see `wrangler.toml`).

- `npm run build` writes the site to `dist/`.
- `worker/index.js` proxies `POST /api/event` to Plausible; every other path is a static asset.
- Merging a PR into `main` requires the **Ready for merge** check (build + tests) and the **Cloudflare Workers** preview build to pass.
- Cloudflare Workers Builds watches `main` and deploys on merge. Nothing deploys from GitHub Actions.
- `public/_headers` sets the CSP and is copied into `dist/` by the build.
- `npm run deploy` deploys by hand with your own Cloudflare login. Normally unnecessary.
