# The Cake Bakery

Simple Next.js e-commerce demo for a cake shop.

## Quick start

1. Install
   ```bash
   npm ci
   ```

2. Local dev
   ```bash
   npm run dev
   ```

3. Build / production
   ```bash
   npm run build
   npm start
   ```

## Environment

Create a local env file from the example before running:

```bash
cp .env.example .env.local
# edit .env.local with real secrets (do NOT commit)
```

Important: do not commit `.env` or secrets. If secrets were committed previously, rotate them immediately.

## Available scripts

- npm run dev — run development server
- npm run build — build production app
- npm start — run production server
- npm run lint — run lints

## CI (dependency check)

This repo uses a lightweight GitHub Actions workflow that installs dependencies and produces an npm audit report:

- Workflow file: .github/workflows/ci.yml
- It runs on push / PR and uploads audit.json as an artifact.

To reproduce locally:

```bash
npm ci
npm audit --json > audit.json || true
cat audit.json
```

If audit shows high severity issues:

- Update direct dependencies: `npm update <pkg>`
- Add resolutions/overrides for transitive fixes if needed
- Re-run audit and push fixes

## Security & housekeeping

- Add `.env` to .gitignore
- Use `.env.example` in repo with placeholders
- Rotate leaked credentials immediately (MongoDB, SMTP, payment keys, Cloudinary, Redis)
- Verify third-party webhooks server-side (e.g., Razorpay) and use timing-safe signature verification

## Contributing

1. Create a branch
2. Run tests/lint locally
3. Open PR

## Contact

Repository owner:
Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

sreenShort

<img width="1902" height="5119" alt="the-cake-bakery-nine vercel app_" src="https://github.com/user-attachments/assets/97cba4e0-b65d-4639-bf15-3894a8e94e43" />
<img width="1902" height="5119" alt="the-cake-bakery-nine vercel app_ (1)" src="https://github.com/user-attachments/assets/c19d5ded-b7e8-45c6-b886-fb3d9c21e3f9" />
