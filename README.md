# অপূর্ব (Apurba) — Official Artist Website

The public-facing artist website for অপূর্ব (Apurba), the independent electronic music project of Khalid Bin Alam.

## Requirements

- Node.js 22.12 or later
- npm

## Local development

```sh
npm install
npm run dev
```

This site is a static React/Vite application and does not require a Gemini API key or server-side environment variables. The production build pre-renders the page HTML for crawlers and hydrates it in the browser.

## Production build

```sh
npm run build
npm run preview
```

The production-ready static site is written to `dist/`. Deploy the **contents** of that directory to a static web host; `node_modules/` is not part of the release. Configure the chosen custom domain with HTTPS and serve the site at the domain root. Keep SPA fallback/rewrite behavior enabled if the hosting provider requires it.

## Team handover and launch checklist

- Start from the project folder. Install dependencies with `npm install` and create a release build with `npm run build`.
- Hand over or deploy the generated `dist/` directory. It contains the pre-rendered page, static assets, and `robots.txt`.
- This project has no configured production domain yet. Before launch, add the selected domain's canonical URL, Open Graph URL, absolute structured-data URLs, and sitemap; then verify `robots.txt` and those URLs on the live site.
- Verify the official artist streaming/profile links, embeds, images, and press-kit downloads on the hosted build.
- The booking form only opens an email draft; it does not send or store inquiries. It currently has no preset recipient, so configure a verified booking address or another inquiry service before launch.
- No server-side API key or environment configuration is required for the static site.
