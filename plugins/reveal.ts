// v-reveal — scroll-triggered reveal, shared site-wide.
//
//   <div v-reveal>            reveals when ~12% visible
//   <div v-reveal="120">      same, with a 120ms stagger delay
//
// The hidden state is applied on mount (client only), so content stays fully
// visible without JS and in the prerendered HTML (SEO). Honors
// prefers-reduced-motion by never hiding anything. One IntersectionObserver
// is shared by every revealed element; each is unobserved after firing.
export default defineNuxtPlugin((nuxtApp) => {
	if (import.meta.server) {
		// SSR stub: render nothing extra, just let Vue resolve the directive.
		nuxtApp.vueApp.directive('reveal', {getSSRProps: () => ({})})
		return
	}

	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

	let observer: IntersectionObserver | null = null
	const getObserver = () => observer ??= new IntersectionObserver((entries) => {
		for (const entry of entries) {
			if (entry.isIntersecting) {
				entry.target.classList.add('reveal--visible')
				observer!.unobserve(entry.target)
			}
		}
	}, {threshold: 0.12, rootMargin: '0px 0px -40px 0px'})

	nuxtApp.vueApp.directive('reveal', {
		mounted(el: HTMLElement, binding) {
			if (reduced) return
			if (binding.value) {
				el.style.setProperty('--reveal-delay', `${binding.value}ms`)
			}
			el.classList.add('reveal')
			getObserver().observe(el)
		},
		unmounted(el: HTMLElement) {
			observer?.unobserve(el)
		},
	})
})
