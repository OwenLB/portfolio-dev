<script lang="ts" setup>
// Load the lottie-player web component on the client only — it registers a
// custom element via browser APIs that are absent during SSR/prerender.
onMounted(() => {
	import("@lottiefiles/lottie-player")
})
</script>

<template>
	<div id="error" class="page">
		<AppEffect/>
		<AppHeader/>
		<main id="main-content">
			<AppSection id="error__empty_before">
				<div class="cell cell--triple-column animation">
				</div>
			</AppSection>
			<AppSection id="error_animation">
				<div class="cell cell--triple-column animation">
					<ClientOnly>
						<lottie-player
							autoplay
							mode="normal"
							src="/404.json"
							style="width: 100%; max-width: 1200px"
						>
						</lottie-player>
					</ClientOnly>
				</div>
			</AppSection>
			<AppSection id="error__empty_after">
				<div class="cell cell--triple-column animation">
				</div>
			</AppSection>
		</main>
		<AppFooter/>
	</div>
</template>

<style lang="scss">
#error {
	grid-template-rows: space(20) auto 140px auto space(20);

	.cell {
		&.animation {
			align-items: center;
			justify-content: center;
			overflow: hidden;
			padding: 0
		}
	}
}

@media screen and (min-width: $md) {
	#error {
		grid-template-rows: space(20) auto 300px auto space(20);
	}
}
</style>