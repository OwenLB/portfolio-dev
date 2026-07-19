<script lang="ts" setup>
// Custom cursor: a dot glued to the pointer + a ring chasing it (lerp), the
// ring swelling over interactive elements. Mounted once in app.vue so it
// survives page navigations. Strictly desktop fine-pointer, skipped under
// prefers-reduced-motion — the native cursor is only hidden (cursor: none via
// html.cursor-custom) when the replacement is actually running.
const root = ref<HTMLElement | null>(null)
const dot = ref<HTMLElement | null>(null)
const ring = ref<HTMLElement | null>(null)

const INTERACTIVE = 'a, button, [role="button"], input, select, textarea, label, summary'

onMounted(() => {
	if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

	document.documentElement.classList.add('cursor-custom')

	let x = -100
	let y = -100
	let ringX = -100
	let ringY = -100
	let visible = false
	let raf = 0

	const loop = () => {
		ringX += (x - ringX) * 0.18
		ringY += (y - ringY) * 0.18
		dot.value!.style.transform = `translate3d(${x}px, ${y}px, 0)`
		ring.value!.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`
		raf = requestAnimationFrame(loop)
	}

	const start = () => raf ||= requestAnimationFrame(loop)
	const stop = () => {
		cancelAnimationFrame(raf)
		raf = 0
	}

	const onMove = (event: MouseEvent) => {
		x = event.clientX
		y = event.clientY
		if (!visible) {
			visible = true
			ringX = x
			ringY = y
			root.value?.classList.add('is-visible')
		}
	}

	// Event delegation — swell the ring over anything interactive.
	const onOver = (event: MouseEvent) => {
		const hit = (event.target as Element).closest?.(INTERACTIVE)
		root.value?.classList.toggle('is-link', !!hit)
	}

	const onOut = (event: MouseEvent) => {
		if (!event.relatedTarget) {
			visible = false
			root.value?.classList.remove('is-visible')
		}
	}

	const onDown = () => root.value?.classList.add('is-down')
	const onUp = () => root.value?.classList.remove('is-down')
	const onVisibility = () => document.hidden ? stop() : start()

	window.addEventListener('mousemove', onMove, {passive: true})
	document.addEventListener('mouseover', onOver, {passive: true})
	document.addEventListener('mouseout', onOut, {passive: true})
	window.addEventListener('mousedown', onDown, {passive: true})
	window.addEventListener('mouseup', onUp, {passive: true})
	document.addEventListener('visibilitychange', onVisibility)
	start()

	onUnmounted(() => {
		stop()
		document.documentElement.classList.remove('cursor-custom')
		window.removeEventListener('mousemove', onMove)
		document.removeEventListener('mouseover', onOver)
		document.removeEventListener('mouseout', onOut)
		window.removeEventListener('mousedown', onDown)
		window.removeEventListener('mouseup', onUp)
		document.removeEventListener('visibilitychange', onVisibility)
	})
})
</script>

<template>
	<div ref="root" aria-hidden="true" class="app-cursor">
		<div ref="ring" class="app-cursor__ring"><span></span></div>
		<div ref="dot" class="app-cursor__dot"><span></span></div>
	</div>
</template>

<style lang="scss" scoped>
// Only shown while the JS is driving it (html.cursor-custom hides the native
// cursor at the same moment) — otherwise this stays invisible and inert.
.app-cursor {
	display: none;
	pointer-events: none;

	@media (hover: hover) and (pointer: fine) {
		display: block;
	}

	opacity: 0;
	transition: opacity var(--dur-fast) ease-in-out;

	&.is-visible {
		opacity: 1;
	}

	&__dot,
	&__ring {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 9999;

		// Position comes from JS (translate3d) — the inner span handles the
		// centering and state scaling so the two never fight over transform.
		span {
			display: block;
			border-radius: 50%;
			transform: translate(-50%, -50%);
			transition: transform 0.25s var(--ease-out), opacity var(--dur-fast) ease-in-out;
		}
	}

	&__dot span {
		width: 6px;
		height: 6px;
		background: var(--primary);
	}

	&__ring span {
		width: 36px;
		height: 36px;
		border: 1px solid var(--primary);
		opacity: 0.5;
	}

	&.is-link &__dot span {
		transform: translate(-50%, -50%) scale(0.5);
	}

	&.is-link &__ring span {
		transform: translate(-50%, -50%) scale(1.6);
		opacity: 0.9;
	}

	&.is-down &__ring span {
		transform: translate(-50%, -50%) scale(0.8);
	}
}
</style>
