<script lang="ts" setup>
const props = defineProps<{
	label: string
	link?: string
	external?: boolean
	// base64 of a full mailto:/tel: href. When set, the real href is assembled
	// client-side on mount so the address never appears in the prerendered HTML
	// or payload (anti-scraping). Until then the link points at "#".
	obfuscated?: string
}>()

const link = computed(() => props.external ? 'href' : 'to')

const obfHref = ref('#')
onMounted(() => {
	if (props.obfuscated) {
		obfHref.value = atob(props.obfuscated)
	}
})
</script>

<template>
	<a v-if="props.obfuscated" :href="obfHref" target="_blank" rel="noopener noreferrer"
	   class="text-link" @click="obfHref === '#' && $event.preventDefault()">
		{{ props.label }}
		<div class="text-link__icon">
			<div class="text-link__icon_container">
				<AppIcon aria-hidden="true" icon="arrow"/>
				<AppIcon aria-hidden="true" icon="arrow"/>
			</div>
		</div>
	</a>
	<NuxtLink v-else :[link]="props.link" :target="props.external? '_blank': '_self'"
			  :rel="props.external ? 'noopener noreferrer' : undefined"
			  class="text-link">
		{{ props.label }}
		<div class="text-link__icon">
			<div class="text-link__icon_container">
				<AppIcon aria-hidden="true" icon="arrow"/>
				<AppIcon aria-hidden="true" icon="arrow"/>
			</div>
		</div>
	</NuxtLink>
</template>

<style lang="scss" scoped>
.text-link {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 space(6);
	height: 56px;
	border: 1px solid var(--accent);
	border-radius: 32px;
	font-size: 1rem;
	@include transition(border);

	&__icon {
		height: space(6);
		width: space(6);
		overflow: hidden;
		display: flex;
		justify-content: flex-end;

		&_container {
			display: flex;
			flex-direction: column;
			gap: space(6);
			@include transition(transform);

			svg {
				display: block;
				flex-shrink: 0;
				@include transition(color);

				&:first-child {
					margin-left: space(12);
				}

				&:last-child {
					color: var(--primary);
				}
			}
		}
	}

	&:where(:hover, :focus, :focus-visible) {
		border: 1px solid var(--primary);

		.text-link__icon_container {
			transform: translate(space(12), space(-12));
		}
	}
}

@media screen and (min-width: $md) {
	.text-link {
		font-size: 1.125rem;
	}
}
</style>
