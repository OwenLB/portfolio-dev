<script lang="ts" setup>
const props = defineProps<{
	src: string
	alt: string
}>()

const isSvg = props.src?.endsWith('.svg') ?? false
const svgContent = ref<string | null>(null)

if (isSvg) {
	const { data } = await useFetch<string>(props.src, {
		key: `svg-${props.src}`,
		responseType: 'text'
	})
	svgContent.value = data.value
}
</script>

<!-- Phrasing-content only (spans, no <figure>): markdown wraps standalone
     images in a <p>, and a real <figure> inside <p> is invalid HTML — the
     browser hoists it out while parsing the prerendered page, shifting the
     whole DOM and breaking hydration for everything after. -->
<template>
	<span class="figure" role="group">
		<span
			v-if="isSvg && svgContent"
			v-html="svgContent"
			class="svg-wrapper"
			:aria-label="alt"
			role="img"
		/>
		<nuxt-img v-else :alt="alt" :src="src" sizes="xs:640 md:100vw"/>
		<!-- Media already exposes `alt` as its accessible name (img alt / svg-wrapper
		     aria-label); hide the duplicate caption from AT. -->
		<span aria-hidden="true" class="figcaption">{{ alt }}</span>
	</span>
</template>

<style lang="scss" scoped>
.figure {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: space(4);

	.figcaption {
		color: var(--text-accent);
		font-size: 0.875rem;
	}

	.svg-wrapper {
		width: 100%;
		overflow-x: auto;

		:deep(svg) {
			width: 100%;
			height: auto;
			background: transparent !important;
		}
	}
}
</style>
