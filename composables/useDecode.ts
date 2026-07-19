// Matrix-style text decode: characters cycle through glyphs and lock in
// left → right. Shared by the v-decode directive (plugins/decode.ts) and the
// project row hover. Returns a cancel function that restores the final text.
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>[]/\\'

export function decodeText(el: HTMLElement, opts: { duration?: number } = {}) {
	// Keep the original across re-triggers (hover spam, reveal + hover…).
	const original = el.dataset.decodeText ?? el.textContent ?? ''
	el.dataset.decodeText = original
	const duration = opts.duration ?? 900
	const start = performance.now()
	let raf = 0
	let last = 0

	// Random glyphs run wider than the real text: without this the element can
	// reflow onto extra lines mid-animation (the masks clip overflow instead).
	const prevWhiteSpace = el.style.whiteSpace
	el.style.whiteSpace = 'nowrap'
	const restore = () => el.style.whiteSpace = prevWhiteSpace

	const step = (now: number) => {
		const p = Math.min((now - start) / duration, 1)
		// Re-scramble at ~25fps — the choppiness is the terminal feel.
		if (now - last >= 40 || p === 1) {
			last = now
			const locked = Math.ceil(p * original.length)
			let out = original.slice(0, locked)
			for (let i = locked; i < original.length; i++) {
				const char = original[i]
				out += /\s/.test(char) ? char : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
			}
			el.textContent = out
		}
		if (p < 1) {
			raf = requestAnimationFrame(step)
		} else {
			restore()
		}
	}

	raf = requestAnimationFrame(step)
	return () => {
		cancelAnimationFrame(raf)
		el.textContent = original
		restore()
	}
}
