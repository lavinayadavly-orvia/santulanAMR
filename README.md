# SantulanAMR

SantulanAMR is a static antimicrobial stewardship education app for guideline navigation, curated case journeys, dosing appropriateness review, and state antibiogram reference.

## Local Validation

```bash
npm run validate
npm run build
```

The production-ready static site is generated in `dist/`.

## Cloudflare Pages

Use these Pages settings:

- Framework preset: `None`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: repository root
- Environment variables: none required

The build intentionally excludes workbook inspection files and development tools from production output. Only deploy-ready static assets are copied into `dist/`.

## Direct Upload

If deploying with Wrangler:

```bash
npm run deploy:cloudflare
```

This runs validation, builds `dist/`, and deploys `dist` to the `santulanamr` Pages project.
