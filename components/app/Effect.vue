<script lang="ts" setup>
const {visible, transform} = useCursor()
</script>

<template>
	<Transition>
		<div v-if="visible" :style="{transform: transform}" class="app__effect"></div>
	</Transition>
</template>

<style lang="scss" scoped>
.app__effect {
	position: absolute;
	top: 0;
	left: 0;
	pointer-events: none;
	width: space(140);
	height: space(140);
	border-radius: 50%;
	// Sharp-ish radial glow sitting *behind* the cells (z-index 2): it only
	// shows through the 1px grid gaps → the grid lines light up around the
	// cursor. Gradient instead of filter: blur() — much cheaper to paint.
	background: radial-gradient(circle closest-side, var(--primary), transparent 72%);
	opacity: 0.5;
	will-change: transform;
}

.v-enter-active,
.v-leave-active {
	@include transition(opacity);
}

.v-enter-from,
.v-leave-to {
	opacity: 0;
}
</style>