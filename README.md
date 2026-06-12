# NEPSE Pro Analyst

A professional, Bloomberg-lite stock analysis dashboard for Nepal Stock Exchange (NEPSE) traders. It provides a dense, feature-rich interface for viewing stock charts, managing a watchlist, and executing AI-powered technical analysis directly from your browser.

## Features (MVP)
- **3-Zone Layout Shell**: Left sidebar navigation, main content area, and a horizontal collapsible sector panel.
- **NEPSE Sector Panel**: Browse all listed NEPSE companies organized by sector with pulse indicators.
- **Chart Integration**: Live NepseAlpha chart iframe for the selected ticker.
- **AI Analysis Engine**: Runs Smart Money Concepts (SMC), ICT Concepts, and Wyckoff technical analysis directly using the Anthropic API from your browser.
- **Watchlist**: Save your favorite tickers to `localStorage`.
- **Important Sites**: Quick launch panel for essential NEPSE resources.
- **100% Static & Serverless**: Can be hosted freely on GitHub Pages without a backend.

## Setup Instructions
1. Clone the repository.
2. Ensure you have Node.js installed.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## How to Configure AI Analysis (API Key)
1. Get an API key from Anthropic (Claude).
2. Open the app in your browser.
3. Navigate to the **Settings** menu on the left sidebar.
4. Enter your Anthropic API Key in the input field. The key is saved locally in your browser's `localStorage` and never sent anywhere else.
5. Go back to the **Dashboard**, select a stock, and click **Run Analysis**.

## Hosting on GitHub Pages
This project is pre-configured via `vite.config.js` to output to the `/docs` folder with relative paths.
1. Run `npm run build`.
2. Commit the changes, including the newly generated `/docs` folder.
3. Push to your GitHub repository.
4. Go to repository Settings > Pages.
5. Set the source to `Deploy from a branch`.
6. Select your `main` branch and choose the `/docs` folder. Save.

## Screenshots
*(Add a screenshot of the dashboard here)*
