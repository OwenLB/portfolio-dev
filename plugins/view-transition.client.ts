// When the browser supports the View Transitions API, page navigations are
// animated by Nuxt's view-transition plugin (experimental.viewTransition) —
// running the Vue curtain pageTransition on top would double the animation.
// Two deliberate exceptions keep the curtain: the very first load (appear)
// and locale switches (/ ⇄ /en), where the sweep reads better than a fade.
export default defineNuxtPlugin(() => {
	if (!document.startViewTransition) return

	const strip = (path: string) => path.replace(/^\/en(?=\/|$)/, '') || '/'

	useRouter().beforeEach((to, from) => {
		if (!from.matched.length) return // initial load: keep the appear curtain
		if (strip(to.path) === strip(from.path)) {
			to.meta.viewTransition = false // locale switch: curtain, not crossfade
			return
		}
		to.meta.pageTransition = false
	})
})
