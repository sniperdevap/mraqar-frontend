import { defineMiddleware } from "astro:middleware";

/**
 * Language by URL, so Google can index both versions:
 *   /…      Arabic (default)
 *   /en/…   English, served by the same pages
 * Internal links in English pages are rewritten to stay under /en.
 * Visitors who picked English before (cookie) are sent to the /en version;
 * crawlers carry no cookie, so they always see the URL's own language.
 */
const LEGACY = /^\/(auth\/(?!signin|signup)|account|plans|ads\/create|admin|notifications)(\/|$|\?)?/;
const SKIP = /^\/(api|_astro|_image)\b|\.[a-z0-9]{2,5}$/i;

export const onRequest = defineMiddleware(async (ctx, next) => {
  const { pathname, search } = ctx.url;

  // Forms: refuse cross-site posts (CSRF). The browser's Origin must match the public host.
  if (ctx.request.method === "POST" && !pathname.startsWith("/api/indexnow")) {
    const origin = ctx.request.headers.get("origin");
    const host = ctx.request.headers.get("x-forwarded-host") || ctx.request.headers.get("host");
    if (origin && host && new URL(origin).host !== host) return new Response("Forbidden", { status: 403 });
  }

  // One URL per page: no trailing slash, no doubled slashes, no /index.html.
  if (pathname.length > 1 && (pathname.endsWith("/") || pathname.includes("//") || pathname.endsWith("/index.html"))) {
    const fixed = pathname.replace(/\/index\.html$/, "").replace(/\/{2,}/g, "/").replace(/\/+$/, "") || "/";
    return new Response(null, { status: 301, headers: { location: fixed + search } });
  }

  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const rest = pathname.slice(3) || "/";
    if (LEGACY.test(rest) || SKIP.test(rest)) return ctx.redirect(rest + search, 302);
    ctx.locals.lang = "en";
    const res = await next(rest + search);
    const loc = res.headers.get("location");
    if (loc && res.status >= 300 && res.status < 400) {
      const u = new URL(loc, ctx.url);
      if (u.origin === ctx.url.origin && !u.pathname.startsWith("/en") && !LEGACY.test(u.pathname) && !SKIP.test(u.pathname)) {
        const headers = new Headers(res.headers);
        headers.set("location", `/en${u.pathname === "/" ? "" : u.pathname}${u.search}`);
        return new Response(null, { status: res.status, headers });
      }
      return res;
    }
    const type = res.headers.get("content-type") || "";
    if (!type.includes("text/html")) return res;
    const html = (await res.text()).replace(
      /(\s(?:href|action)=")(\/(?!\/|en\/|en")[^"]*)"/g,
      (m, attr: string, url: string) => (LEGACY.test(url) || SKIP.test(url.split(/[?#]/)[0]) ? m : `${attr}/en${url === "/" ? "" : url}"`),
    );
    const headers = new Headers(res.headers);
    headers.delete("content-length");
    return new Response(html, { status: res.status, headers });
  }

  if (ctx.request.method === "GET" && !SKIP.test(pathname) && !LEGACY.test(pathname) && ctx.cookies.get("lang")?.value === "en") {
    return ctx.redirect(`/en${pathname === "/" ? "" : pathname}${search}`, 302);
  }
  ctx.locals.lang = "ar";
  return next();
});
