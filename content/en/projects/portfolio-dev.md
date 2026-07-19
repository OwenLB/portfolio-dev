---
order: 4
title: 'Developer Portfolio'
type: "Website"
description: "Bilingual portfolio built with Nuxt 3 in SSR + static prerendering — per-URL bilingual (FR / EN), Markdown content, live Spotify integration and CSS-only page transitions."
git: [ "Git Repository", "https://github.com/OwenLB/portfolio-dev" ]
web: [ "Visit site", "https://owenlebec.fr" ]
stack: [
  "Nuxt 3",
  "TypeScript",
  "Vue 3",
  "@nuxt/content",
  "@nuxt/image",
  "@nuxtjs/i18n",
  "@nuxtjs/sitemap",
  "SCSS",
  "Netlify"
]
updated: '2026-07-17'
---

**The very site you're reading right now** — bilingual by URL, statically prerendered, and built for SEO and accessibility alike.

## What's the context behind this portfolio?

Personal portfolio covering projects, work experience, and contact information. The site is bilingual by URL (FR at `/`, EN under `/en/…`), embeds a live Spotify integration to display the currently playing track, and is deployed on Netlify with SSR + static prerendering (every page of both languages is generated at build time, with `hreflang` and canonical tags). The Spotify API route runs as a Netlify Edge Function (Deno).

## What's the tech stack?

- **Nuxt 3 (`ssr: true` + prerendering)** — the build prerenders every route of both languages to full HTML (`nitro.prerender.crawlLinks`), served statically by Netlify then hydrated client-side. The HTML carries content, OG meta and JSON-LD on first paint (LCP + indexability), with no Node server at runtime.
- **@nuxt/content v2** — all content in Markdown with TypeScript-typed frontmatter. No database, no REST API — `.md` files are the source of truth, queried with `queryContent()`. Note: content `_path` values have no locale prefix (`/projects/finixa`), so queries target the slug rather than `route.path` (which is `/en`-prefixed in English).
- **URL-based i18n (`@nuxtjs/i18n`, `prefix_except_default`)** — FR at `/`, EN under `/en/…`, each language with its own crawlable URL. Per-locale `hreflang` + canonical via `useLocaleHead()`, with the `lang` cookie kept for the visitor's preference. Switching language is a navigation (`switchLocalePath()`) — the blind animation is played by the page transition. `queryContent` queries filter by `_locale`.
- **Auto sitemap (`@nuxtjs/sitemap`)** — `/sitemap.xml` is a per-locale index (`fr-FR.xml` + `en-US.xml`) generated from the prerendered routes, fed by the canonical site URL (`site.url`).
- **SCSS without a CSS framework** — custom design system: `space($n)` function (= `n × 4px`), `transition()` mixin, CSS custom properties for light/dark theming (`--primary`, `--background`, `--accent`, `--text`).
- **@nuxt/image with Netlify provider** — project cover images (`.webp`) are served through the Netlify CDN with on-the-fly resizing at delivery.
- **Git LFS** — `.webp` files are tracked via `.gitattributes` to avoid storing large binaries in git history.
- **Netlify Edge Function (Deno)** — `netlify/edge-functions/spotify.ts` serves the `/api/spotify` route. Exchanges a refresh token for an access token on every request, without storing tokens or exposing credentials client-side.
- **Umami Analytics** — async script loaded via `useHead`, no cookies, no personal data sent to third parties.

## Notable technical points

- **CSS Grid with `display: contents`**: the main grid is defined on `.page` (4–5 columns). `AppHeader` and `AppSection` use `display: contents`, making their child cells direct participants of the parent grid regardless of depth in the Vue component tree. Editorial layout without wrapper noise — but `display: contents` removes elements from the accessibility tree, requiring explicit ARIA handling on affected components.

- **CSS-only page transitions**: transitions use the `.cell:before` pseudo-element positioned off-screen by default (`inset: -1px calc(100% + 1px) -1px -1px`). The `.page-leave-to` class slides it over the full cell, creating coordinated blind-closing effects. Zero JavaScript — only Nuxt page transition hooks + CSS. Cleanly disabled via `prefers-reduced-motion`.

- **Slug validation middleware**: `middleware/project.ts` runs a `queryContent()` before rendering the project page. If the slug doesn't exist, `abortNavigation()` is called — navigation is cancelled cleanly instead of rendering an empty page. The check is locale-agnostic (projects exist in both FR and EN), which keeps the middleware out of the i18n lifecycle.

- **Inlined SVGs for diagrams**: `ProseImg.vue` detects `.svg` images and fetches them via `useFetch` to inject as raw HTML inside a `.svg-wrapper`. Diagrams are therefore themable via CSS — hence the explicit `fill`, `stroke` and `color` overrides on internal SVG elements in `[slug].vue` for dark mode.

- **Stagger animation via IntersectionObserver**: the project list animates with an `IntersectionObserver` (threshold 0.15). Each project link gets a `transitionDelay` calculated from its index (`index × 400ms`), producing the staggered entrance without an animation library.

## What I learned

Designing a CSS Grid layout that flows through multiple Vue component levels via `display: contents` requires a precise understanding of its accessibility tree impact: elements with `display: contents` are transparent to the visual DOM but not to screen readers. The CSS-only page transition required several iterations of timing to coordinate the old component's exit with the new one's entrance without a flash of content in between.

---

## Diagrams

### Global architecture

![Global architecture](/diagrams/portfolio-dev/architecture.svg)

---

### Reactive i18n system

![Reactive i18n system](/diagrams/portfolio-dev/i18n.svg)

---

### CSS Grid layout structure

![CSS Grid layout structure](/diagrams/portfolio-dev/grid.svg)
