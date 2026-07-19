<template>
	<div class="wave" aria-hidden="true"/>
</template>

<style lang="scss" scoped>
.wave {
	position: fixed;
	inset: 0 0 auto 0;
	height: 55vh;
	pointer-events: none;
	z-index: 8;
	// Bell-curve gradient: transparent → primary glow → transparent
	background: linear-gradient(
		to bottom,
		transparent 0%,
		color-mix(in srgb, var(--primary) 4%, transparent) 25%,
		color-mix(in srgb, var(--primary) 14%, transparent) 50%,
		color-mix(in srgb, var(--primary) 4%, transparent) 75%,
		transparent 100%
	);
	// Start above viewport, sweep to well below
	transform: translateY(-55vh);
	animation: wave-sweep 2s cubic-bezier(0.25, 0, 0.75, 1) 1.5s forwards;

	@media (prefers-reduced-motion: reduce) {
		display: none;
	}
}

@keyframes wave-sweep {
	from { transform: translateY(-55vh); }
	to   { transform: translateY(200vh); }
}
</style>
