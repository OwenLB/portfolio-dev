<script lang="ts" setup>
const props = defineProps<{
	label: string,
	type?: string,
	path: string,
	// Position in the list — rendered as the editorial "01" index (desktop).
	index?: number,
	// Marks this entry as the shared element morphing into the project hero
	// (View Transitions). Only the home list opts in: naming the "related
	// projects" cards too would make every card fly across the page on each
	// navigation. Names must be unique per page, hence the slug suffix.
	shared?: boolean,
}>()

const localePath = useLocalePath()
const theme = useTheme()
const coverSrc = computed(() => {
	const suffix = theme.value === 'dark' ? '-dark' : ''
	return `/images${props.path}${suffix}.webp`
})
const cover = computed(() => `url("${coverSrc.value}") no-repeat top center / cover`)
const slug = computed(() => props.path.split('/').pop())
const vtCover = computed(() => props.shared ? `project-cover-${slug.value}` : 'none')
const vtTitle = computed(() => props.shared ? `project-title-${slug.value}` : 'none')
const number = computed(() => props.index !== undefined ? String(props.index + 1).padStart(2, '0') : '')

// Desktop hover: the project image floats under the cursor (the row itself is
// text-only there). Teleported to <body>: inside the row it would inherit the
// cells' stacking context and any ancestor transform would hijack its fixed
// positioning. The wrapper is a 0×0 point moved per mousemove; the CSS
// transition on its transform makes it chase the cursor with a small lag.
// Cover + view-transition-name are inline styles (v-bind CSS vars don't reach
// teleported nodes).
const preview = ref<HTMLElement | null>(null)
const hoverLabel = ref<HTMLElement | null>(null)
const previewActive = ref(false)
// The active preview is the desktop shared element morphing into the hero.
// Robustness hinges on both ends using the SAME raw image URL (the hero must
// not go through the image CDN, or the new snapshot waits on an uncached
// variant and the picture blinks out mid-transition).
const previewStyle = computed(() => ({
	background: cover.value,
	viewTransitionName: previewActive.value ? vtCover.value : 'none',
}))
let fine = false
let placed = false
let cancelDecode: (() => void) | null = null
let restTimer: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
	fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
		&& !window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

onUnmounted(() => {
	cancelDecode?.()
	clearTimeout(restTimer)
})

const clamp = (v: number, max: number) => Math.max(-max, Math.min(max, v))

function rest(el: HTMLElement) {
	el.style.setProperty('--preview-tilt', '0deg')
}

// Anchored repulsion: the preview lives at a fixed anchor above the row's
// center and shifts AWAY from the cursor — cursor left of the anchor pushes
// it right, approaching it makes it recede, leaving lets it drift back. The
// wrapper's transform transition turns those retargets into an organic glide.
function place(event: MouseEvent) {
	const el = preview.value
	if (!el) return
	const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
	const anchorX = rect.left + rect.width / 2
	const anchorY = rect.top
	const offsetX = clamp((anchorX - event.clientX) * 0.22, 64)
	// Vertical repulsion is measured from the row's center (the cursor can
	// only travel within the row, so the lever is shorter — bigger factor).
	const offsetY = clamp((rect.top + rect.height / 2 - event.clientY) * 0.85, 34)
	el.style.setProperty('transform', `translate3d(${(anchorX + offsetX).toFixed(1)}px, ${(anchorY + offsetY).toFixed(1)}px, 0)`)
	// Directional lean while the cursor travels, upright at rest.
	el.style.setProperty('--preview-tilt', `${clamp(event.movementX * 0.4, 6).toFixed(2)}deg`)
	clearTimeout(restTimer)
	restTimer = setTimeout(() => rest(el), 90)
}

function onEnter(event: MouseEvent) {
	if (!fine) return
	if (!placed && preview.value) {
		// First hover: teleport to the cursor instead of gliding in from 0,0.
		preview.value.style.transition = 'none'
		place(event)
		void preview.value.offsetWidth
		preview.value.style.transition = ''
		placed = true
	} else {
		place(event)
	}
	previewActive.value = true
	cancelDecode?.()
	if (hoverLabel.value) cancelDecode = decodeText(hoverLabel.value, {duration: 350})
}

function onMove(event: MouseEvent) {
	if (fine && previewActive.value) place(event)
}

function onLeave() {
	previewActive.value = false
	cancelDecode?.()
	cancelDecode = null
	clearTimeout(restTimer)
	if (preview.value) rest(preview.value)
}
</script>

<template>
	<NuxtLink :to="localePath(props.path)" class="project-link"
			  @mouseenter="onEnter" @mouseleave="onLeave" @mousemove="onMove">
		<div class="project-link__overlay"></div>
		<span v-if="number" aria-hidden="true" class="project-link__index">{{ number }}</span>
		<div class="project-link__title">
			<span class="project-link__title_default">{{ props.label }}</span>
			<span ref="hoverLabel" aria-hidden="true" class="project-link__title_hover">{{ props.label }}</span>
		</div>
		<template v-if="props.type">
			<span class="project-link__type">{{ props.type }}</span>
		</template>
		<span aria-hidden="true" class="project-link__arrow">
			<AppIcon icon="arrow"/>
		</span>
		<ClientOnly>
			<Teleport to="body">
				<div ref="preview" aria-hidden="true" class="project-link__preview">
					<div :class="{'is-active': previewActive}" :style="previewStyle"
						 class="project-link__preview_inner"></div>
				</div>
			</Teleport>
		</ClientOnly>
	</NuxtLink>
</template>

<style lang="scss" scoped>
@use "sass:color";

// Mobile: image card (the editorial row + floating preview is desktop-only).
.project-link {
	position: relative;
	min-height: 100px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: flex-start;
	gap: space(1);
	padding: space(8) var(--main-space) space(4);
	background: v-bind(cover);
	view-transition-name: v-bind(vtCover);

	&__overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(to right, color.adjust($dark, $alpha: -0.2), color.adjust($dark, $alpha: -1));
	}

	&__index {
		position: absolute;
		top: space(3);
		left: var(--main-space);
		z-index: 1;
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: color.adjust($light, $alpha: -0.25);
	}

	// A one-line clip window holding the two stacked labels of the hover
	// slide. Cap accents (É) overflow their line box: the top padding
	// (cancelled by the margin) keeps the first label's accents visible, and
	// the hover label sits 0.3em lower so its accents can't peek into the
	// window — the slide compensates (see :hover below).
	&__title {
		font-size: var(--text-card);
		line-height: 1.35;
		padding-top: 0.2em;
		margin-top: -0.2em;
		max-height: calc(1.35em + 0.2em); // border-box: window = padding + one line
		overflow: hidden;
		z-index: 1;
		display: flex;
		flex-direction: column;
		view-transition-name: v-bind(vtTitle);

		span {
			font-family: var(--font-display);
			color: $light;
			text-transform: uppercase;
			transition: transform 0.4s var(--ease-expo), color var(--dur-fast) ease-in-out;
		}

		&_default {
			font-weight: bold;
		}

		&_hover {
			font-weight: 300;
			margin-top: 0.3em;
		}
	}

	// Below the title, same metadata voice as the desktop index rows.
	&__type {
		z-index: 1;
		color: color.adjust($light, $alpha: -0.2);
		font-family: var(--font-mono);
		font-size: 0.75rem;
	}

	&__arrow {
		display: none;
	}

	&:where(:hover,:focus, :focus-visible) {
		.project-link__title {
			&_default, &_hover {
				transform: translateY(calc(-100% - 0.3em));
			}
		}
	}

	&:where(:focus, :focus-visible) {
		.project-link__title {
			span {
				color: var(--primary);
			}
		}
	}
}

// Desktop: editorial index row — number / title / type / arrow, 1px rules.
@media screen and (min-width: $md) {
	.project-link {
		height: auto;
		flex: 1;
		flex-direction: row;
		align-items: center;
		padding: space(6) 0;
		background: none;
		border-top: 1px solid var(--accent);
		gap: var(--main-space);
		view-transition-name: none;

		&:last-child {
			border-bottom: 1px solid var(--accent);
		}

		&__overlay {
			display: none;
		}

		&__index {
			position: static;
			font-family: var(--font-mono);
			font-size: 0.8rem;
			color: var(--text-accent);
			transition: color var(--dur-fast) ease-in-out;
		}

		&__title {
			flex: 1;

			span {
				color: var(--text);
			}

			&_hover {
				color: var(--primary);
			}
		}

		&__type {
			font-size: 0.8rem;
			color: var(--text-accent);
			transition: color var(--dur-fast) ease-in-out;
		}

		&__arrow {
			display: flex;
			align-items: center;
			color: var(--primary);
			opacity: 0;
			transform: translateX(space(-2));
			transition: opacity var(--dur-fast) ease-in-out, transform 0.3s var(--ease-out);
		}

		&:where(:hover, :focus, :focus-visible) {
			.project-link__index {
				color: var(--primary);
			}

			.project-link__arrow {
				opacity: 1;
				transform: translateX(0);
			}
		}
	}
}

// Floating image preview — teleported to <body>, so styled at top level (it is
// no longer a DOM descendant of .project-link). A fixed 0×0 anchor moved to
// the cursor on every mousemove; the transform transition makes it trail.
.project-link__preview {
	display: none;
	position: fixed;
	top: 0;
	left: 0;
	z-index: 999;
	pointer-events: none;
	transition: transform 0.25s var(--ease-out);

	@media screen and (min-width: $md) {
		display: block;
	}
}

// Floats above-right of the pointer (its bottom-left corner near the cursor),
// so neither the hovered row nor its title animation is ever covered. The
// scale grows out of that corner, i.e. from the cursor.
.project-link__preview_inner {
	width: min(340px, 32vw);
	aspect-ratio: 16 / 10;
	border-radius: 6px;
	// 1px rule + shadow so screenshots of this very site don't melt into the
	// page background (same color).
	border: 1px solid var(--accent);
	box-shadow: 0 28px 64px -20px rgba(6, 20, 35, 0.55);
	opacity: 0;
	// Centered above the anchor (the row's top-center).
	transform: translate(-50%, calc(-100% - #{space(3)})) scale(0.85) rotate(var(--preview-tilt, 0deg));
	transform-origin: bottom center;
	transition: opacity 0.25s var(--ease-out), transform 0.35s var(--ease-out);

	&.is-active {
		opacity: 1;
		transform: translate(-50%, calc(-100% - #{space(3)})) scale(1) rotate(var(--preview-tilt, 0deg));
	}
}
</style>
