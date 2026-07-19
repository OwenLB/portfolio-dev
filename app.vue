<script lang="ts" setup>
import {Lang} from "~/types/lang";
// Hashed URLs of the above-the-fold fonts (hero display + body), preloaded so
// the browser doesn't wait for style + layout to discover them (LCP is the h1).
import ppfcLightUrl from "~/assets/fonts/PPFormulaCondensed-Light.woff2?url";
import ppfcBoldUrl from "~/assets/fonts/PPFormulaCondensed-Bold.woff2?url";
import strawfordRegularUrl from "~/assets/fonts/Strawford-Regular.woff2?url";

const theme = useTheme()
const lang = useLang()

// html.boot (set pre-paint in nuxt.config's inline script) plays the curtain
// sweep on first load — Vue's `appear` can't (no transition on hydrated
// nodes). Dropped once played so later-mounted cells never replay it.
onMounted(() => setTimeout(() => document.documentElement.classList.remove('boot'), 1000))

// hreflang alternates + canonical + og:locale, derived from i18n.baseUrl.
const i18nHead = useLocaleHead()
useHead(() => ({
	htmlAttrs: {lang: i18nHead.value.htmlAttrs!.lang, dir: i18nHead.value.htmlAttrs!.dir},
	link: i18nHead.value.link,
	meta: i18nHead.value.meta,
}))

useHead({
	titleTemplate(chunk) {
		const title = lang.value === Lang.Fr ? 'Owen LE BEC — Ingénieur logiciel Full Stack' : 'Owen LE BEC — Full Stack Software Engineer'
		return chunk ? `${chunk} - ${title}` : title
	},
	htmlAttrs: {
		'data-theme': () => theme.value
	},
	link: [
		{
			rel: 'icon',
			href: '/favicon.svg',
			type: 'image/svg+xml',
		},
		...[ppfcLightUrl, ppfcBoldUrl, strawfordRegularUrl].map((href) => ({
			rel: 'preload' as const,
			as: 'font' as const,
			type: 'font/woff2',
			href,
			crossorigin: '' as const,
		})),
	],
	meta: [
		{
			name: 'google-site-verification',
			content: '9enTEnn4TDcfVaSIV1jMyTsCIZJhQEYHnzRlQhtEWDY'
		},
		{ property: 'og:site_name', content: 'Owen LE BEC' },
		{ property: 'og:type', content: 'website' },
		{ property: 'og:image', content: 'https://owenlebec.fr/images/owen.webp' },
		{ property: 'og:image:width', content: '420' },
		{ property: 'og:image:height', content: '420' },
		{ property: 'og:image:alt', content: 'Owen LE BEC' },
		{ name: 'twitter:card', content: 'summary' },
		{ name: 'twitter:image', content: 'https://owenlebec.fr/images/owen.webp' },
	],
	script: [
		{
			src: 'https://analytics.umami.is/script.js',
			'data-website-id': '12b2ec53-e4c6-44e9-b7ee-19a339dc0ea2',
			async: true
		},
		{
			type: 'application/ld+json',
			innerHTML: JSON.stringify({
				'@context': 'https://schema.org',
				'@type': 'Person',
				name: 'Owen LE BEC',
				jobTitle: 'Full Stack Software Engineer',
				url: 'https://owenlebec.fr',
				image: 'https://owenlebec.fr/images/owen.webp',
				sameAs: [
					'https://github.com/OwenLB',
					'https://www.linkedin.com/in/OwenLB/'
				]
			})
		}
	]
})</script>

<template>
	<a class="skip-to-main" href="#main-content">
		{{ lang === Lang.Fr ? 'Aller au contenu principal' : 'Skip to main content' }}
	</a>
	<NuxtPage :key="lang" :lang="lang"/>
	<AppCursor/>
</template>

<style lang="scss">
.skip-to-main {
	position: absolute;
	left: -9999px;
	top: space(2);
	z-index: 999;
	padding: space(2) space(4);
	background: var(--primary);
	color: $dark;
	font-weight: 600;
	border-radius: 4px;

	&:focus {
		left: space(2);
	}
}

::-moz-selection {
	color: $dark;
	background: var(--primary);
}

::selection {
	color: $dark;
	background: var(--primary);
}

* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
}

:focus-visible {
	outline: 2px solid var(--primary);
	outline-offset: 2px;
	border-radius: 2px;
}

// Theme switch via View Transition (AppHeader.switchTheme): colors flip
// instantly inside the snapshots — the expanding clip-path circle on the new
// snapshot is the only animation.
html.theme-vt {
	--theme-t: 0s;

	&::view-transition-old(root),
	&::view-transition-new(root) {
		animation: none;
		mix-blend-mode: normal;
	}
}

html {
	font-size: 100%;
	font-family: var(--font-body);
	color: var(--text);
	background: var(--background);
	transition: background-color var(--theme-t), color var(--theme-t);

	// The replacement cursor (AppCursor) is running — hide the native one.
	&.cursor-custom,
	&.cursor-custom * {
		cursor: none !important;
	}
}

body {
	background: var(--background);
	transition: background-color var(--theme-t);
}

.page {
	position: relative;
	display: grid;
	grid-template-columns: minmax(space(6), calc((100% - 1200px) / 2)) repeat(2, minmax(0, 400px)) minmax(space(6), calc((100% - 1200px) / 2));
	gap: 1px;
	background: var(--accent);
	// clip, not hidden: hidden turns .page into a scrollport, which silently
	// kills every position: sticky inside (the experiences' giant year).
	// Old browsers ignore clip and keep hidden.
	overflow: hidden;
	overflow: clip;
	min-height: 100vh;
	transition: background-color var(--theme-t);

	main {
		display: contents;
	}

	// Desktop only (mobile has no trailing spacer row — footer flush): the
	// spacer row has no cell, so the accent background and its 1px gap lines
	// would show as a bare framed box under the footer. This absolute strip
	// (outside the grid, under the cells' z-index) blankets it.
	@media screen and (min-width: $md) {
		&::after {
			content: '';
			position: absolute;
			left: 0;
			right: 0;
			bottom: 0;
			height: space(25);
			z-index: 1;
			background: var(--background);
			transition: background-color var(--theme-t);
		}
	}
}

a {
	color: var(--text);
	text-decoration: none;
}

h1, h2, h3 {
	text-wrap: balance;
}

p {
	line-height: 1.75rem;
	text-wrap: pretty;
}

ul {
	list-style-type: none;
	display: flex;
	flex-direction: column;
	gap: space(4);

	li {
		display: flex;
		align-items: center;
		gap: space(4);

		&:before {
			content: '';
			width: space(4);
			height: 1px;
			background: var(--text);
		}
	}
}

h2 {
	font-family: var(--font-display);
	font-weight: bold;
	font-size: var(--text-title);
	letter-spacing: 0.045em;
	color: var(--primary);
	line-height: 1;

	a {
		color: var(--primary);
		text-decoration: underline;
		text-underline-offset: 8px;
		text-decoration-thickness: 1px;
		text-decoration-color: var(--background);
		transition: text-decoration-color 0.2s ease-in-out;

		&:where(:hover, :focus, :focus-visible) {
			text-decoration-color: var(--primary);
		}
	}
}

[data-content-id] {
	h2:not(:first-child) {
		margin-top: space(10);
	}
}

.cell, section .cell {
	position: relative;
	background: var(--background);
	z-index: 2;
	transition: background-color var(--theme-t);

	&--desktop {
		display: none;
	}

	&--mobile {
		display: block;
		padding: 0;
	}

	&:before {
		content: '';
		position: absolute;
		inset: -1px calc(100% + 1px) -1px -1px;
		background: $primary;
		z-index: 2;
		transition: all 0.6s var(--ease-expo);
	}
}

@media screen and (min-width: $md) {
	.page {
		grid-template-columns: minmax(space(10), calc((100% - 1200px) / 2))  repeat(3, minmax(0, 400px)) minmax(space(10), calc((100% - 1200px) / 2));
	}

	.cell {
		&--desktop {
			display: flex;
		}

		&--mobile {
			display: none;
		}
	}
}

@media screen and (max-width: $md) {
	.cell {
		&.responsive {
			padding: 0;
		}
	}
}

@media (prefers-reduced-motion: no-preference) {
	// First-load curtain (html.boot is removed right after).
	html.boot .cell:before {
		animation: boot-curtain 0.45s cubic-bezier(0.83, 0, 0.17, 1) 0.08s both;
	}

	@keyframes boot-curtain {
		from {
			inset: -1px;
		}

		to {
			inset: -1px calc(100% + 1px) -1px -1px;
		}
	}

	// View Transitions (navigation + shared elements carte → page projet) —
	// aligned on the site-wide motion language. Inert on browsers without
	// support, where the Vue curtain transition below takes over.
	::view-transition-group(*),
	::view-transition-old(*),
	::view-transition-new(*) {
		animation-duration: 0.5s;
		animation-timing-function: var(--ease-expo);
	}

	// v-reveal (plugins/reveal.ts) — the .reveal class is only ever added
	// client-side and never under prefers-reduced-motion.
	.reveal {
		opacity: 0;
		transform: translate3d(0, space(8), 0);
		backface-visibility: hidden;
		transition: opacity 0.7s var(--ease-out) var(--reveal-delay, 0s),
		transform 0.7s var(--ease-out) var(--reveal-delay, 0s);

		&--visible {
			opacity: 1;
			// `none`, not translate3d(0,0,0): a residual transform would turn the
			// element into the containing block of fixed descendants (the floating
			// project preview) and clip them into their cell.
			transform: none;
		}
	}

	.page-enter-active,
	.page-leave-active {
		transition: var(--dur-base) inset 0.08s var(--ease-expo);
	}

	.page-enter-from,
	.page-leave-to {
		.cell:before {
			inset: -1px -1px -1px -1px;
		}
	}
}
</style>