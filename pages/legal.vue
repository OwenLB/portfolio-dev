<script lang="ts" setup>
import {Legal} from "~/types/pages/legal";

const lang = useLang()

const {data: content}: { data: Legal } = await useAsyncData(`legal-${lang.value}`,
	() => queryCollection(`legal_${lang.value}` as 'legal_fr' | 'legal_en').first())

useSeoMeta({
	title: computed(() => content.value?.title),
	description: computed(() => content.value?.description),
	ogTitle: computed(() => content.value?.title),
	ogDescription: computed(() => content.value?.description),
})
</script>

<template>
	<div id="legal" class="page">
		<AppEffect/>
		<AppHeader/>
		<main id="main-content">
			<AppSection id="about__description">
				<div class="cell cell--triple-column content">
					<ContentRenderer :value="content" class="content"/>
				</div>
			</AppSection>
		</main>
		<AppFooter/>
	</div>
</template>

<style lang="scss">
#legal {
	// No trailing spacer row on mobile — footer flush with the page bottom.
	grid-template-rows: space(20) auto;

	@media screen and (min-width: $md) {
		grid-template-rows: space(20) auto space(20);
	}

	.content {
		display: flex;
		flex-direction: column;
		gap: 24px;

		p {
			strong {
				font-weight: 500;
			}
		}

		a {
			color: var(--primary);
			text-decoration: underline;
			text-decoration-color: var(--background);
			text-underline-offset: 4px;
			transition: text-decoration-color 0.2s ease-in-out;

			&:where(:hover, :focus, :focus-visible) {
				text-decoration-color: var(--primary);
			}
		}
	}
}
</style>