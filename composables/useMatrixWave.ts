// Module-level state — shared across all Matrix instances (client only)
let triggered    = false
let startTime: number | null = null

const DURATION   = 2000  // ms for the wave to cross the page
const PAGE_RANGE = 2600  // px of page height the wave covers
const WAVE_START = -180  // px above the viewport before entering

export function triggerMatrixWave(delayMs = 650) {
	// Only the first instance to call this actually triggers the wave
	if (triggered) return
	triggered = true

	if (!import.meta.client) return
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

	setTimeout(() => {
		startTime = performance.now()
	}, delayMs)
}

/**
 * Returns the wave Y position local to the given canvas element,
 * or null when the wave is inactive.
 */
export function getWaveLocalY(cv: HTMLCanvasElement): number | null {
	if (startTime === null) return null

	const elapsed = performance.now() - startTime

	if (elapsed > DURATION + 400) {
		// Wave finished — reset so it can replay on next navigation
		startTime = null
		triggered = false
		return null
	}

	const t      = Math.min(elapsed / DURATION, 1)
	const pageY  = WAVE_START + t * (PAGE_RANGE - WAVE_START)
	const rect   = cv.getBoundingClientRect()

	return pageY - rect.top - window.scrollY
}
