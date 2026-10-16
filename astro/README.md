# Mr Aqar — Astro frontend

Server-rendered Astro site for the public pages (home, search, ad pages, offices, blog,
info pages). Minimal JavaScript, fast pages, full SEO (canonical, Open Graph,
breadcrumb + RealEstateListing structured data, sitemap with photos, Atom feed of new ads).

## Run
```bash
cp .env.example .env    # set API_URL and IMAGE_HOST
npm install
npm run build && npm start   # http://localhost:4321 (PORT/HOST env to change)
npm run dev                  # http://localhost:3005
```

## Ad URLs
`/{purpose}/{type}/{governorate}-governorate/{area}/{id}`, e.g. `/rent/apartments/hawalli-governorate/salwa/4071`.
Old `/ads/{id}` links and outdated slugs 301-redirect to the current URL.

## Dates and Google
Every date Google sees (visible date, structured data, sitemap `lastmod`, feed) is the
ad's posted / re-posted date (`createdAt`). `updatedAt` changes on every view, so it
must never be used for SEO dates.

## Migration (strangler pattern)
Until phase 3, nginx sends account features to the current Next.js app and everything
else to Astro:
```nginx
location ~ ^/(auth|account|plans|ads/create|ads/edit|notifications|admin|_next)(/|$) { proxy_pass http://127.0.0.1:3002; }
location / { proxy_pass http://127.0.0.1:4321; }
```
After launch, submit both `/sitemap.xml` and `/feed.xml` in Google Search Console.
