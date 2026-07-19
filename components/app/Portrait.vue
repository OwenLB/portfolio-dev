<script lang="ts" setup>
// Portrait parallax: the photo drifts gently with the cursor (rAF-lerped)
// while the arc behind stays put — the offset between the two layers reads
// as depth, with zero distortion. Desktop fine-pointer only; the static
// <img> is the SSR/mobile/reduced-motion state.
const wrap = ref<HTMLElement | null>(null)
const img = ref<HTMLElement | null>(null)

onMounted(() => {
	const host = wrap.value
	const el = img.value
	if (!host || !el) return
	if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

	const target = {x: 0, y: 0}
	const pos = {x: 0, y: 0}
	let raf = 0
	let running = false

	const onMove = (event: MouseEvent) => {
		const rect = host.getBoundingClientRect()
		target.x = Math.max(-1, Math.min(1, (event.clientX - rect.left - rect.width / 2) / rect.width))
		target.y = Math.max(-1, Math.min(1, (event.clientY - rect.top - rect.height / 2) / rect.height))
	}

	const loop = () => {
		pos.x += (target.x - pos.x) * 0.06
		pos.y += (target.y - pos.y) * 0.06
		// Sunk 8px at rest so the ±7px drift always stays in the clipped zone:
		// no gap when drifting up, no overhang when drifting down (the wrapper
		// clips everything below the arc line — see clip-path).
		el.style.translate = `${(pos.x * 9).toFixed(2)}px ${(8 + pos.y * 7).toFixed(2)}px`
		raf = requestAnimationFrame(loop)
	}
	const start = () => {
		if (!running) {
			running = true
			raf = requestAnimationFrame(loop)
		}
	}
	const stop = () => {
		running = false
		cancelAnimationFrame(raf)
	}

	window.addEventListener('mousemove', onMove, {passive: true})
	let onScreen = true
	const sync = () => (onScreen && !document.hidden ? start() : stop())
	const io = new IntersectionObserver((entries) => {
		onScreen = entries.some((entry) => entry.isIntersecting)
		sync()
	})
	io.observe(host)
	document.addEventListener('visibilitychange', sync)
	sync()

	onUnmounted(() => {
		stop()
		io.disconnect()
		document.removeEventListener('visibilitychange', sync)
		window.removeEventListener('mousemove', onMove)
	})
})
</script>

<template>
	<div ref="wrap" class="app-portrait">
		<img ref="img" alt="Owen LE BEC" class="arc-image" src="/images/owen.webp" width="420" height="420">
	</div>
</template>

<style lang="scss" scoped>
.app-portrait {
	position: relative;
	// Clip ONLY below the arc line: negative insets keep the top and sides
	// free (the hand and head are meant to overflow the arc).
	clip-path: inset(-40% -25% 0 -25%);

	img {
		will-change: translate;
	}
}
</style>
