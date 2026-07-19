---
order: 1
title: 'Finixa'
type: "App web & mobile"
description: "Application web mobile-first de gestion de finances personnelles — suivi de dépenses, budgets par enveloppe et transactions récurrentes."
git: [ "Répertoire Git", "https://github.com/OwenLB/finixa" ]
web: [ "Voir l'app", "https://finixa.net/" ]
stack: [
  "Nuxt 4",
  "Vue 3",
  "TypeScript",
  "Pinia",
  "Supabase",
  "PostgreSQL",
  "SCSS",
  "Capacitor",
  "Deno (Edge Functions)"
]
updated: '2026-07-17'
---

**Ajouter une dépense en moins de cinq secondes depuis son téléphone** : c'est la contrainte qui a guidé chaque décision de Finixa, du schéma PostgreSQL jusqu'au geste de saisie.

## Quel est le contexte de Finixa ?

Finixa est un MVP de SaaS de finances personnelles centré sur une contrainte UX précise : **ajouter une dépense le plus vite possible depuis un mobile**. Le projet couvre le suivi de dépenses et revenus, la gestion de budgets par catégorie et sous-catégorie, le budget par enveloppe (50/30/20), les transactions récurrentes virtuelles, et des statistiques mensuelles avec RPCs PostgreSQL. L'app est packagée pour iOS/Android via Capacitor en plus du déploiement web.

## Quelle stack technique ?

- **Nuxt 4 + Vue 3 (SPA, hash routing)** — SSR désactivé intentionnellement : le hash routing est nécessaire pour la compatibilité Capacitor, le protocole `capacitor://` ne supportant pas le push-state routing.
- **TypeScript strict** — Les montants sont signés en base (`-50` = dépense, `+1000` = revenu). Le discriminant central est `TransactionType ('depense' | 'revenu' | 'epargne')`, utilisé de la base de données jusqu'aux composants.
- **Pinia (15 stores)** — Architecture en trois couches : `app/services/` isole les appels Supabase, les stores détiennent l'état et exposent les mutations, les pages et composants consomment les stores. Aucun appel Supabase direct dans les composants.
- **Supabase (PostgreSQL + Auth + RLS)** — Row Level Security sur toutes les tables. Les vues calculées (stats, récurrences virtuelles) sont des RPCs PostgreSQL appelées directement depuis les services.
- **Edge Functions (Deno)** — Quatre fonctions pour les intégrations externes : ajout rapide de transaction via API key, digest quotidien, push notifications, listing de catégories.
- **SCSS custom (design system par tokens)** — Pas de Tailwind. Les tokens sont auto-injectés dans chaque composant via `additionalData` dans `nuxt.config`. Les composants utilisent uniquement des CSS custom properties sémantiques.
- **Capacitor 8** — Packaging iOS/Android, `@capacitor/preferences` pour le stockage local sécurisé (PIN, thème, onboarding).
- **@nuxtjs/i18n** — Localisation complète FR/EN, stratégie `no_prefix` compatible hash routing.

## Points techniques notables

### 1 · Flux d'ajout de transaction

Du tap sur le bouton jusqu'à la mise à jour réactive de l'interface — la séparation des couches en action. Le composant `add.vue` ne connaît que le store, le store ne connaît que le service, le service ne connaît que Supabase.

### 2 · Date d'opération vs date comptable

Chaque transaction a une `date` (quand l'opération a lieu) et une `accounting_date` (nullable, quand elle est imputée au budget). Pour les récurrentes avec `accounting_offset: 'next_month'`, la date comptable est fixée au 1er du mois suivant lors de la matérialisation. Cas d'usage concret : un abonnement prélevé le 28 décembre mais comptabilisé sur le budget de janvier.

### 3 · Versioning des budgets de sous-catégories

Modifier un budget ne réécrit pas l'historique : une nouvelle ligne est créée avec `valid_from`, l'ancienne est fermée avec `valid_to`. Les requêtes de stats utilisent la date pour trouver le budget en vigueur à cette époque — les statistiques de janvier restent exactes même si le budget a changé en mai.

### 4 · Récurrences virtuelles et matérialisation lazy

Les transactions récurrentes ne sont pas persistées en base par défaut. À chaque chargement, `getDatesInRange()` calcule les occurrences sur la période et `getOccurrenceKey()` génère un identifiant stable. Seules les occurrences non encore enregistrées sont affichées comme "virtuelles". La persistance n'a lieu que lorsque l'utilisateur coche une occurrence.

`getDatesInRange()` gère le clamping des jours-du-mois (ex. mensuel le 31 → 28 fév.) et tous les cas limites de fréquences hebdomadaires, trimestrielles et annuelles.

### 5 · RPCs PostgreSQL pour toutes les agrégations

Aucune logique de stats côté front. Toutes les vues calculées sont des fonctions SQL : `get_subcategory_stats`, `get_variable_daily_remaining`, `recurring_virtual_for_month`, etc. Appelées via `supabase.rpc()` depuis les services.

### 6 · Système d'API key pour intégrations externes

Les Edge Functions Deno exposent des endpoints authentifiés par SHA-256 d'une clé générée par l'utilisateur. Permet d'ajouter une transaction depuis un raccourci iOS Shortcuts sans exposer les credentials Supabase.

## Design system SCSS

Les tokens sont définis en deux couches : palette primitive (jamais utilisée directement dans les composants) et propriétés CSS sémantiques (seules utilisées dans les composants). Le fichier de tokens est **auto-injecté** dans chaque `<style lang="scss">` via `additionalData` dans `nuxt.config.ts` — aucun import manuel nécessaire.

## Ce que j'ai appris / apporté

La partie la plus complexe a été la logique de récurrences : calculer des occurrences virtuelles stables sur n'importe quelle fenêtre temporelle, avec clamping des jours (ex. mensuel le 31 → 28 fév.), tout en gérant la désynchronisation entre date d'opération et date comptable. Le versioning des budgets en base a nécessité de repenser le schéma pour que les requêtes de stats soient déterministes quelle que soit la période interrogée.

---

## Schémas

### Architecture globale

![Architecture globale](/diagrams/finixa/01-architecture.svg)

---

### Flux d'ajout de transaction

![Flux d'ajout de transaction](/diagrams/finixa/02-add-transaction-flow.svg)

---

### Date d'opération vs date comptable

![Date d'opération vs date comptable](/diagrams/finixa/03-accounting-date.svg)

---

### Versioning des budgets

![Versioning des budgets de sous-catégories](/diagrams/finixa/04-budget-versioning.svg)

---

### Récurrences virtuelles

![Récurrences virtuelles et matérialisation lazy](/diagrams/finixa/05-virtual-recurring.svg)

---

### Flux d'authentification API key

![Flux d'authentification API key](/diagrams/finixa/06-api-key-flow.svg)

---

### Design system SCSS

![Design system SCSS — tokens et injection](/diagrams/finixa/07-scss-design-system.svg)
