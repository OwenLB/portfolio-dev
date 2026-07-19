export default defineNuxtConfig({
	compatibilityDate: '2026-05-28',
	ssr: true,
	experimental: {
		// Shared-element transition card → project page. Skipped automatically
		// under prefers-reduced-motion; unsupported browsers keep the Vue
		// curtain transition (see plugins/view-transition.client.ts).
		viewTransition: true,
	},
	app: {
		pageTransition: {name: 'page', mode: 'out-in', appear: true},
		head: {
			script: [
				{
					// Set the theme before first paint to avoid a light flash for
					// dark-mode users in SPA mode (data-theme is otherwise only applied on hydration).
					innerHTML: `(function(){try{var m=document.cookie.match(/(?:^|; )theme=([^;]+)/);var t=m?decodeURIComponent(m[1]):(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t);document.documentElement.classList.add('boot');}catch(e){}})();`,
					tagPosition: 'head',
				},
			],
		},
	},
	runtimeConfig: {
		spotifyClientId: process.env.SPOTIFY_CLIENT_ID,
		spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET,
		spotifyRefreshToken: process.env.SPOTIFY_REFRESH_TOKEN
	},
	// Global CSS (font-faces, design tokens as custom properties) — loaded once.
	css: ['~/assets/scss/base.scss'],
	vite: {
		css: {
			preprocessorOptions: {
				scss: {
					additionalData: '@use "@/assets/scss/style.scss" as *;'
				}
			}
		}
	},
	modules: [
		'@nuxt/content', '@nuxt/image', '@nuxtjs/i18n', '@nuxtjs/sitemap'
	],
	sitemap: {
		// /about and /en/about are legacy redirect-only routes (see
		// netlify.toml) — never real content, so they shouldn't be listed as
		// indexable URLs.
		exclude: ['/about', '/en/about'],
	},
	// Canonical site URL — consumed by @nuxtjs/sitemap (and i18n baseUrl below).
	// trailingSlash matches Netlify's enforced trailing slash on non-root
	// routes, so sitemap <loc> entries resolve without an extra 301 hop.
	site: {
		url: 'https://owenlebec.fr',
		trailingSlash: true,
	},
	i18n: {
		locales: [
			{code: 'fr', language: 'fr-FR', name: 'Français'},
			{code: 'en', language: 'en-US', name: 'English'},
		],
		defaultLocale: 'fr',
		// FR stays at "/", EN is served under "/en/…" so each language has its
		// own crawlable URL (cookie still drives the visitor's preference).
		strategy: 'prefix_except_default',
		baseUrl: 'https://owenlebec.fr',
		// Netlify enforces a trailing slash on every non-root route. Without this,
		// localePath()/switchLocalePath() and the canonical + hreflang tags from
		// useLocaleHead() emit slash-less URLs that immediately 301 to the slash
		// version -- a self-inconsistent canonical and an avoidable redirect hop.
		trailingSlash: true,
		detectBrowserLanguage: {
			useCookie: true,
			cookieKey: 'lang',
			redirectOn: 'root',
		},
	},
	image: {
		provider: 'netlify',
	},
	nitro: {
		prerender: {
			crawlLinks: true,
			// Seed both locale roots; localized in-page links let the crawler
			// reach /en/projects/… and /en/legal on its own.
			routes: ['/', '/en', '/legal', '/en/legal'],
			// @nuxt/image (Netlify provider) emits <link rel="preload"> to
			// /.netlify/images?... which only exists at runtime on Netlify's CDN.
			// Don't let the crawler try to prerender it (would 404 and fail the build).
			ignore: ['/.netlify'],
		},
	}
})
