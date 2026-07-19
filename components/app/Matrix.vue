<script lang="ts" setup>
const canvas = ref<HTMLCanvasElement | null>(null)
const cursor = { x: -9999, y: -9999 }

onMounted(() => {
	const cv = canvas.value
	if (!cv) return
	const ctx = cv.getContext('2d')
	if (!ctx) return

	// Respect reduced-motion: render a single static frame, no perpetual loop.
	const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

	// Trigger wave once across all Matrix instances (1st caller wins)
	triggerMatrixWave(650)

	const CHARS       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZｦｧｩｫｭｯｱｳｵｷｹｻｽｿﾁﾃﾅﾇﾉ0123456789<>[]|/\\'
	const FS          = 9
	const TRAIL       = 12
	const SPEED_MIN   = 0.28
	const SPEED_MAX   = 0.60
	const BASE_ALPHA_DARK  = 0.18
	const BASE_ALPHA_LIGHT = 0.40

	function getBaseAlpha() {
		return document.documentElement.dataset.theme === 'dark'
			? BASE_ALPHA_DARK
			: BASE_ALPHA_LIGHT
	}
	const GLOW_EXTRA  = 0.55  // cursor proximity bonus
	const GLOW_R      = 180   // cursor glow radius px
	const WAVE_WIDTH  = 180   // half-width of the reveal wave px
	const WAVE_BOOST  = 0.62  // peak opacity added by wave

	// On mobile we keep the animation but halve the draw rate (~30fps) — the
	// expensive per-frame redraw is the cost, not the rAF callback itself.
	const isMobile  = window.matchMedia('(max-width: 767px)').matches
	const FRAME_MIN = isMobile ? 33 : 0  // ms between draws (0 = uncapped)

	let rafId = 0
	let running = false
	let lastDraw = 0
	let drops: { col: number; y: number; speed: number; chars: string[] }[] = []

	function rndChar() {
		return CHARS[Math.floor(Math.random() * CHARS.length)]
	}

	function getPrimary(): [number, number, number] {
		const hex = getComputedStyle(document.documentElement)
			.getPropertyValue('--primary').trim().replace('#', '')
		return [
			parseInt(hex.slice(0, 2), 16) || 35,
			parseInt(hex.slice(2, 4), 16) || 122,
			parseInt(hex.slice(4, 6), 16) || 253,
		]
	}

	function init() {
		const parent = cv.parentElement
		if (!parent) return
		cv.width  = parent.offsetWidth  || 300
		cv.height = parent.offsetHeight || 200

		const cols = Math.floor(cv.width / FS)
		drops = Array.from({ length: cols * 3 }, (_, i) => ({
			col:   i % cols,
			y:     Math.random() * cv.height * 1.5,
			speed: SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN),
			chars: Array.from({ length: TRAIL + 1 }, rndChar),
		}))
	}

	function draw() {
		const w = cv.width
		const h = cv.height
		const [r, g, b] = getPrimary()

		// Keep the canvas transparent so the parent cell's CSS-transitioning
		// background shows through — guarantees perfect theme-change sync.
		ctx.clearRect(0, 0, w, h)

		ctx.font = `${FS}px 'Courier New', monospace`

		// Cursor local coords
		const rect = cv.getBoundingClientRect()
		const lx = cursor.x - rect.left
		const ly = cursor.y - rect.top

		// Wave local Y (null when inactive)
		const waveY = getWaveLocalY(cv)

		for (const drop of drops) {
			const x = drop.col * FS + 1

			for (let j = 0; j <= TRAIL; j++) {
				const charY = drop.y - j * FS
				if (charY < -FS || charY > h) continue

				const fade = 1 - j / TRAIL

				// Always-visible base
				const base = fade * getBaseAlpha()

				// Cursor proximity glow
				const dx   = x      - lx
				const dy   = charY  - ly
				const dist = Math.sqrt(dx * dx + dy * dy)
				const glow = Math.max(0, 1 - dist / GLOW_R) * GLOW_EXTRA

				// Reveal wave (top-to-bottom sweep on page load)
				const waveDist = waveY !== null ? Math.abs(charY - waveY) : 9999
				const wave     = Math.max(0, 1 - waveDist / WAVE_WIDTH) * WAVE_BOOST

				const alpha = base + glow + wave

				if (j === 0) {
					ctx.fillStyle = `rgba(255,255,255,${Math.min(alpha * 1.6, 0.85).toFixed(3)})`
				} else {
					ctx.fillStyle = `rgba(${r},${g},${b},${alpha.toFixed(3)})`
				}

				ctx.fillText(drop.chars[j], x, charY)

				if (j > 0 && Math.random() > 0.97) drop.chars[j] = rndChar()
			}

			if (!prefersReduced) {
				drop.y += drop.speed
				if (drop.y - TRAIL * FS > h) {
					drop.y = -TRAIL * FS
					drop.speed = SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN)
					drop.chars = Array.from({ length: TRAIL + 1 }, rndChar)
				}
			}
		}

	}

	function onMove(e: MouseEvent) {
		cursor.x = e.clientX
		cursor.y = e.clientY
	}

	function loop(ts: number) {
		if (!FRAME_MIN || ts - lastDraw >= FRAME_MIN) {
			draw()
			lastDraw = ts
		}
		rafId = requestAnimationFrame(loop)
	}

	function start() {
		if (running || prefersReduced) return
		running = true
		// Only listen for the cursor glow while actually animating.
		window.addEventListener('mousemove', onMove, {passive: true})
		rafId = requestAnimationFrame(loop)
	}

	function stop() {
		if (!running) return
		running = false
		cancelAnimationFrame(rafId)
		window.removeEventListener('mousemove', onMove)
	}

	init()
	draw() // paint one frame immediately (the only frame under reduced-motion)

	const ro = new ResizeObserver(init)
	if (cv.parentElement) ro.observe(cv.parentElement)

	// A continuous rAF on an off-screen or background-tab canvas is pure wasted
	// CPU — only run the loop while the canvas is visible and the tab is active.
	let onScreen = true
	function sync() {
		if (onScreen && !document.hidden) start()
		else stop()
	}

	const io = new IntersectionObserver((entries) => {
		onScreen = entries.some((e) => e.isIntersecting)
		sync()
	})
	io.observe(cv.parentElement || cv)
	document.addEventListener('visibilitychange', sync)

	onUnmounted(() => {
		stop()
		ro.disconnect()
		io.disconnect()
		document.removeEventListener('visibilitychange', sync)
	})
})
</script>

<template>
	<canvas ref="canvas" class="matrix"/>
</template>

<style lang="scss" scoped>
.matrix {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	display: block;
}
</style>
