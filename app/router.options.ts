import type {RouterConfig} from '@nuxt/schema'

// Explicit scroll behavior: Nuxt's default defers scrolling until the page
// transition ends, which the View Transitions path never signals — navigating
// project → project (related links at the bottom) landed at the bottom of the
// new page. Rules: back/forward restores the saved position, locale switches
// (/ ⇄ /en, same page) keep the current position, anything else starts at top.
export default <RouterConfig>{
	scrollBehavior(to, from, savedPosition) {
		if (savedPosition) return savedPosition
		const strip = (path: string) => path.replace(/^\/en(?=\/|$)/, '') || '/'
		if (strip(to.path) === strip(from.path)) return {}
		return {top: 0}
	},
}
