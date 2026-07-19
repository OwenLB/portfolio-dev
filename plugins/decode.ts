// v-decode — Matrix-style decode of a text element when it scrolls into view,
// then replayed forever at random intervals (each element on its own clock).
//
//   <h2 v-decode>CONTACT</h2>
//   <span v-decode="300">…</span>   (300ms start delay for the first run)
//
// Client-only (prerendered HTML keeps the real text) and skipped entirely
// under prefers-reduced-motion. The element's accessible name is pinned via
// aria-label before any scrambling, so screen readers never see glyph soup.
// Elements must contain plain text only.

// Bounds of the random pause between two replays of the same element.
const REPLAY_MIN_MS = 7000
const REPLAY_MAX_MS = 18000

export default defineNuxtPlugin((nuxtApp) => {
	if (import.meta.server) {
		nuxtApp.vueApp.directive('decode', {getSSRProps: () => ({})})
		return
	}

	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

	const visible = new WeakSet<Element>()
	const timers = new WeakMap<Element, ReturnType<typeof setTimeout>>()
	const cancels = new WeakMap<Element, () => void>()
	const started = new WeakSet<Element>()

	const run = (el: HTMLElement) => {
		cancels.get(el)?.()
		cancels.set(el, decodeText(el, {duration: 700}))
	}

	// Each element re-arms its own random timer — replays stay desynchronized
	// and distinct across elements. Off-screen or hidden-tab ticks just re-arm.
	const schedule = (el: HTMLElement) => {
		const pause = REPLAY_MIN_MS + Math.random() * (REPLAY_MAX_MS - REPLAY_MIN_MS)
		timers.set(el, setTimeout(() => {
			if (visible.has(el) && !document.hidden) run(el)
			schedule(el)
		}, pause))
	}

	let observer: IntersectionObserver | null = null
	const getObserver = () => observer ??= new IntersectionObserver((entries) => {
		for (const entry of entries) {
			const el = entry.target as HTMLElement
			if (!entry.isIntersecting) {
				visible.delete(el)
				continue
			}
			visible.add(el)
			if (!started.has(el)) {
				started.add(el)
				const delay = Number(el.dataset.decodeDelay) || 0
				setTimeout(() => run(el), delay)
				schedule(el)
			}
		}
	}, {threshold: 0.5})

	nuxtApp.vueApp.directive('decode', {
		mounted(el: HTMLElement, binding) {
			if (reduced) return
			if (!el.getAttribute('aria-label') && !el.closest('[aria-hidden="true"]')) {
				el.setAttribute('aria-label', el.textContent ?? '')
			}
			if (binding.value) {
				el.dataset.decodeDelay = String(binding.value)
			}
			getObserver().observe(el)
		},
		unmounted(el: HTMLElement) {
			observer?.unobserve(el)
			clearTimeout(timers.get(el))
			cancels.get(el)?.()
		},
	})
})
