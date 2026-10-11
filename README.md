# Brigitte Lubker — portfolio

Next.js site with a searchable art gallery and an `/admin` page for uploading
artwork from a phone or computer.

## How images work

- **Your original file is kept exactly as uploaded**, byte for byte. Only you
  can download it (from `/admin`).
- On upload, the site makes four web-sized copies (480, 960, 1600 and 2400px
  wide WebP). Visitors' browsers pick the smallest one that looks sharp on
  their screen: a phone gallery loads ~50–250 KB per piece instead of 7 MB.
- Colours stay in your phone's Display P3 profile, so saturated paint colours
  aren't dulled on modern screens. Camera/location data is stripped from the
  public copies.
- Tick **Pixel art** when uploading sprites: those are never resized and are
  scaled up with hard pixel edges instead of blurring.
- iPhone HEIC photos: upload from the phone's browser and it converts them to
  JPEG automatically. From a computer, export as JPEG first.

## Running it locally

```bash
npm install
docker compose up -d                 # local Postgres on port 5433
cp .env.example .env                 # then fill in the two admin values:
npm run hash-password -- "your password"   # -> ADMIN_PASSWORD_HASH
#   SESSION_SECRET: any long random string
npx prisma migrate dev
npm run dev                          # http://localhost:3000
```

Uploads go to `./uploads` locally (gitignored).

## Deploying

Pushing to `main` deploys automatically on Railway (see `railway.toml`). There
is no build folder to copy anywhere any more.

Railway needs: a Postgres service, a volume mounted at `/data` with
`UPLOAD_DIR=/data/uploads`, plus `ADMIN_PASSWORD_HASH` and `SESSION_SECRET`.

## Where things are

| | |
|---|---|
| Pages | `src/app/` (`page.js` = home, `gallery/`, `admin/`) |
| Your existing components | `src/components/`, `src/views/` (plain CSS, same as before) |
| Gallery + search + lightbox | `src/components/Gallery.tsx` |
| Upload processing | `src/lib/storage.ts` |
| Database schema | `prisma/schema.prisma` |
