# Portfolio Développeur — Owen Le Bec

Portfolio personnel déployé sur [owenlebec.fr](https://owenlebec.fr). Bilingue FR/EN, construit avec Nuxt 3 en mode SPA statique. Contenu entièrement en Markdown via `@nuxt/content`, intégration Spotify live et transitions de page CSS-only.

[![Nuxt](https://img.shields.io/badge/Nuxt-3-00DC82?logo=nuxtdotjs&logoColor=white)](https://nuxt.com)
[![Vue](https://img.shields.io/badge/Vue-3-4FC08D?logo=vuedotjs&logoColor=white)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Netlify](https://img.shields.io/badge/Netlify-static%20%2B%20Edge%20Functions-00C7B7?logo=netlify&logoColor=white)](https://netlify.com)
[![Demo](https://img.shields.io/badge/demo-owenlebec.fr-000000)](https://owenlebec.fr)

---

<p align="center">
  <img src="public/images/projects/portfolio-dev.webp" width="45%" alt="Portfolio en thème clair" />
  <img src="public/images/projects/portfolio-dev-dark.webp" width="45%" alt="Portfolio en thème sombre" />
</p>

---

## Contexte

Portfolio personnel présentant mes projets, mon parcours et une étude de cas détaillée par projet. Bilingue FR/EN avec URL dédiée par langue (pas de query param), contenu 100 % Markdown sans base de données, et quelques détails soignés (transitions de page natives, intégration Spotify en direct, fallback de polices sans layout shift).

## Fonctionnalités clés

- Contenu entièrement en Markdown (`@nuxt/content`), un fichier par page/section, en FR et en EN
- URLs bilingues crawlables (`/` pour le FR, `/en/…` pour l'EN) avec `hreflang` et canonical par locale
- Sitemap multilingue généré automatiquement par `@nuxtjs/sitemap`
- Widget "actuellement en écoute" branché sur l'API Spotify via une Netlify Edge Function
- Thème clair/sombre, persistant (cookie) et sensible à la préférence système
- Transitions de page natives (View Transitions API) avec repli CSS-only pour les navigateurs non supportés
- Fonts auto-hébergées avec fallback à métriques ajustées (CLS ≈ 0)
- Analytics sans cookie (Umami)

## Stack technique

| Outil | Rôle |
|---|---|
| Nuxt 3 (`ssr: true`) | SPA statique — build via `nuxt generate`, déployé pré-rendu sur Netlify |
| Vue 3 Composition API | Composants et logique réactive |
| TypeScript | Typage du frontmatter, des composables et des types de page |
| @nuxt/content v2 | Système de contenu Markdown — source de vérité sans base de données |
| @nuxtjs/i18n | Localisation FR/EN, stratégie `prefix_except_default` |
| @nuxtjs/sitemap | Sitemap par locale généré à partir des routes pré-rendues |
| @nuxt/image | Optimisation des images à la livraison via le provider Netlify |
| SCSS | Design system maison (`space()`, `transition()`, variables CSS custom) |
| Netlify | Hébergement statique + Edge Function (Deno) pour la route Spotify |
| Git LFS | Stockage des images `.webp` hors de l'historique git |
| Umami | Analytics privacy-first, sans cookie |

## Architecture

```
content/
  fr/                  → home.md, profile.md, experiences.md, projects/
  en/                  → (structure parallèle)
pages/
  index.vue            → home
  about.vue
  projects/[slug].vue  → page projet dynamique
netlify/edge-functions/
  spotify.ts           → Edge Function Deno (échange refresh_token → track en cours)
composables/
  useLang.ts           → locale active (renvoie le `locale` de @nuxtjs/i18n)
  useTheme.ts          → thème clair/sombre (cookie + system-preference)
  useCursor.ts         → effet de lumière curseur
middleware/
  project.ts           → validation du slug avant rendu
```

**Système i18n** : `@nuxtjs/i18n` en `prefix_except_default` — FR à `/`, EN sous `/en/…`, chaque langue ayant son URL crawlable (`hreflang` + canonical par locale, cookie `lang` pour la préférence). Changer de langue = navigation via `switchLocalePath()`. Les queries `queryContent` filtrent par `_locale`.

**Layout CSS Grid** : `.page` définit une grille 4–5 colonnes. `AppHeader` et `AppSection` utilisent `display: contents`, rendant leurs cellules enfants participants directs de la grille du parent quelle que soit la profondeur dans l'arbre de composants.

**Transitions de page** : navigation via la View Transitions API native quand disponible — la carte projet cliquée sur l'accueil se transforme directement en hero de la page projet (`view-transition-name` par slug). Repli CSS-only (`.cell:before`, `inset` slide) pour les navigateurs sans support. Désactivé via `prefers-reduced-motion`.

## Points techniques notables

- **`_path` sans préfixe de locale** — `@nuxt/content` indexe le contenu par chemin non préfixé (`/projects/finixa`), alors que `route.path` porte un préfixe `/en` côté anglais : les requêtes de contenu se font par slug, jamais par `route.path` directement.
- **Fallback de polices à métriques ajustées** — chaque famille de police auto-hébergée (PP Formula Condensed, Strawford, JetBrains Mono) a un `@font-face` de secours local avec `size-adjust`/`ascent-override` recalculés, pour un CLS quasi nul le temps du chargement des `.woff2`.
- **Un seul point d'injection SCSS** — `assets/scss/style.scss` (tokens, jamais de CSS émis) est injecté dans chaque composant via `additionalData` côté Vite ; `assets/scss/base.scss` (le seul fichier qui émet du CSS) n'est chargé qu'une fois globalement — la distinction évite de dupliquer des règles CSS dans chaque feuille de style de composant.

## Cloner et lancer en local

Prérequis : **Node.js 20+**.

```bash
git clone https://github.com/OwenLB/portfolio-dev.git
cd portfolio-dev
npm install
npm run dev        # http://localhost:3000
```

Variables d'environnement nécessaires pour l'intégration Spotify (optionnel) :

```env
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REFRESH_TOKEN=
```

Sans ces variables, le widget Spotify affiche simplement "Déconnecté".

```bash
npm run build      # Build production (SSR/Nitro)
npm run generate   # Génère le site statique (utilisé par Netlify)
npm run preview    # Prévisualisation du build
```

## Ajouter un projet

1. Créer `content/fr/projects/<slug>.md` et `content/en/projects/<slug>.md`
2. Ajouter une image de couverture `public/images/projects/<slug>.webp`
3. Le slug est automatiquement disponible sur `/projects/<slug>` — le middleware valide son existence avant le rendu

Frontmatter attendu :

```yaml
---
title: 'Titre du projet'
type: "Projet Personnel"
description: "Une phrase affichée dans la liste."
git: [ "Répertoire Git", "https://github.com/..." ]   # omettre si privé
web: [ "Voir le site", "https://..." ]                 # omettre si pas de démo
stack: [ "Tech 1", "Tech 2" ]
---
```
