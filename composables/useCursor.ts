export default function () {
	const visible = ref(false)
	const transform = ref('')
	let raf = 0
	let pending: MouseEvent | null = null

	// Batch reactivity to one update per frame — mousemove can fire much
	// faster than the display refreshes.
	function apply() {
		raf = 0
		if (!pending) return
		visible.value = true
		// Center the 560px (space(140)) grid-spotlight on the pointer.
		transform.value = `translate(${pending.pageX - 280}px, ${pending.pageY - 280}px)`
		pending = null
	}

	function update(event: MouseEvent) {
		pending = event
		if (!raf) raf = requestAnimationFrame(apply)
	}

	onMounted(() => {
		// Decorative glow tied to the pointer — pointless on touch devices.
		if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
		window.addEventListener('mousemove', update, {passive: true})
	})
	onUnmounted(() => {
		window.removeEventListener('mousemove', update)
		cancelAnimationFrame(raf)
	})

	return {visible, transform}
}
