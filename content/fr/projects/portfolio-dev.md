---
order: 4
title: 'Portfolio Développeur'
type: "Site"
description: "Portfolio bilingue construit avec Nuxt 3 en SSR + prérendu statique — bilingue par URL (FR / EN), contenu Markdown, intégration Spotify live et transitions de page CSS-only."
git: [ "Répertoire Git", "https://github.com/OwenLB/portfolio-dev" ]
web: [ "Voir le site", "https://owenlebec.fr" ]
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

**Le site que vous lisez en ce moment** : bilingue par URL, prérendu statique, et pensé autant pour le SEO que pour l'accessibilité.

## Quel est le contexte de ce portfolio ?

Portfolio personnel qui regroupe projets, expériences et informations de contact. Le site est bilingue par URL (FR à `/`, EN sous `/en/…`), embarque une intégration Spotify temps réel pour afficher le morceau en cours d'écoute, et est déployé sur Netlify en SSR + prérendu statique (chaque page des deux langues est générée à la build, avec `hreflang` et canonical). La route API Spotify tourne via une Netlify Edge Function (Deno).

## Quelle stack technique ?

- **Nuxt 3 (`ssr: true` + prérendu)** — le build prérend chaque route des deux langues en HTML complet (`nitro.prerender.crawlLinks`), servi statiquement par Netlify puis hydraté côté client. Le HTML contient le contenu, les meta OG et le JSON-LD dès la première peinture (LCP + indexabilité), sans serveur Node à l'exécution.
- **@nuxt/content v2** — contenu entièrement en Markdown avec frontmatter typé TypeScript. Pas de base de données ni d'API REST — les fichiers `.md` sont la source de vérité, requêtés via `queryContent()`. À noter : les `_path` de contenu ne portent pas de préfixe de locale (`/projects/finixa`), donc les requêtes ciblent le slug et non `route.path` (préfixé `/en` en anglais).
- **i18n par URL (`@nuxtjs/i18n`, `prefix_except_default`)** — FR à `/`, EN sous `/en/…`, chaque langue ayant sa propre URL crawlable. `hreflang` + canonical par locale via `useLocaleHead()`, cookie `lang` conservé pour la préférence du visiteur. Changer de langue est une navigation (`switchLocalePath()`) — l'animation de volets est jouée par la transition de page. Les `queryContent` filtrent par `_locale`.
- **Sitemap auto (`@nuxtjs/sitemap`)** — `/sitemap.xml` est un index par locale (`fr-FR.xml` + `en-US.xml`) généré depuis les routes prérendues, alimenté par l'URL canonique (`site.url`).
- **SCSS sans framework CSS** — design system maison : fonction `space($n)` (= `n × 4px`), mixin `transition()`, variables CSS custom pour le thème clair/sombre (`--primary`, `--background`, `--accent`, `--text`).
- **@nuxt/image avec provider Netlify** — les images de couverture des projets (`.webp`) sont servies via le CDN Netlify avec redimensionnement automatique à la livraison.
- **Git LFS** — les `.webp` sont trackées via `.gitattributes` pour éviter de stocker des binaires lourds dans l'historique git.
- **Netlify Edge Function (Deno)** — `netlify/edge-functions/spotify.ts` sert la route `/api/spotify`. Échange le refresh token contre un access token à chaque appel, sans stocker de token ni exposer les credentials côté client.
- **Umami Analytics** — script async chargé via `useHead`, sans cookie, sans transmission de données personnelles à des tiers.

## Points techniques notables

- **CSS Grid avec `display: contents`** : la grille principale est définie sur `.page` (4–5 colonnes). `AppHeader` et `AppSection` utilisent `display: contents`, ce qui rend leurs cellules enfants participants directs de la grille du parent, quelle que soit la profondeur dans l'arbre Vue. Layout éditorial sans wrappers parasites — mais `display: contents` retire les éléments de l'arbre d'accessibilité, ce qui a demandé des ajustements ARIA sur les composants concernés.

- **Transition de page CSS-only** : les transitions utilisent le pseudo-élément `.cell:before` positionné hors écran par défaut (`inset: -1px calc(100% + 1px) -1px -1px`). La classe `.page-leave-to` le fait glisser sur toute la cellule, créant un effet de volets fermants coordonnés. Zéro JavaScript, uniquement les hooks Nuxt page transitions + CSS. Désactivé proprement via `prefers-reduced-motion`.

- **Middleware de validation de slug** : `middleware/project.ts` exécute un `queryContent()` avant le rendu de la page projet. Si le slug n'existe pas, `abortNavigation()` est appelé — la navigation est annulée proprement plutôt que de rendre une page vide. La vérification est indépendante de la locale (les projets existent en FR et EN), ce qui garde le middleware hors du cycle de vie i18n.

- **SVG inlinés pour les diagrammes** : `ProseImg.vue` détecte les images `.svg` et les récupère via `useFetch` pour les injecter en HTML brut dans un `.svg-wrapper`. Les diagrammes sont ainsi thémables via CSS — d'où les overrides explicites de `fill`, `stroke` et `color` sur les éléments SVG internes dans `[slug].vue` pour le mode sombre.

- **Stagger animation via IntersectionObserver** : la liste des projets s'anime avec un `IntersectionObserver` (threshold 0.15). Chaque lien projet reçoit un `transitionDelay` calculé depuis son index (`index × 400ms`), créant l'entrée décalée sans librairie d'animation.

## Ce que j'ai appris

Concevoir un layout CSS Grid qui traverse plusieurs niveaux de composants Vue via `display: contents` demande une connaissance précise de l'impact sur l'arbre d'accessibilité : les éléments avec `display: contents` sont transparents pour le DOM visuel mais pas pour les lecteurs d'écran. La transition de page CSS-only a demandé plusieurs itérations de timing pour coordonner la sortie de l'ancien composant et l'entrée du nouveau sans flash de contenu entre les deux.

---

## Schémas

### Architecture globale

![Architecture globale](/diagrams/portfolio-dev/architecture.svg)

---

### Système i18n réactif

![Système i18n réactif](/diagrams/portfolio-dev/i18n.svg)

---

### Structure du layout CSS Grid

![Structure CSS Grid](/diagrams/portfolio-dev/grid.svg)
