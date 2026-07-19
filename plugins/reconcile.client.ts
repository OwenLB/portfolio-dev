import {Theme} from '~/types/theme'

// Under SSR the prerendered pages carry no cookie, so the global theme state
// hydrates from the (default) build-time payload. After the app mounts, re-apply
// the visitor's persisted theme cookie so their saved choice takes effect.
// Runs client-side only and post-hydration, so it does not cause a mismatch.
// (Language is now handled by @nuxtjs/i18n, which owns the cookie + the URL.)
export default defineNuxtPlugin((nuxtApp) => {
	nuxtApp.hook('app:mounted', () => {
		const themeCookie = useCookie<Theme>('theme')
		const theme = useState<Theme>('theme')
		if (themeCookie.value && themeCookie.value !== theme.value) {
			theme.value = themeCookie.value
		}
	})
})
