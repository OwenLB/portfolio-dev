<!--suppress TypeScriptUnresolvedReference -->
<script lang="ts" setup>
import {Spotify} from "~/types/spotify";
import {Lang} from "~/types/lang";

const lang = useLang()
const { data: spotify } = useFetch<Spotify>('/api/spotify', { server: false, lazy: true })

const titleEl = ref<HTMLElement | null>(null)
const spanEl  = ref<HTMLElement | null>(null)

watch(spotify, () => {
	const title = titleEl.value
	const span  = spanEl.value
	if (!title || !span) return

	span.classList.remove('animated')
	span.style.removeProperty('--scroll-distance')

	// Nothing to scroll when disconnected: the "Déconnecté"/"Disconnected"
	// label is static, so skip the marquee even if it technically overflows.
	if (!spotify.value?.isConnected) return

	const SPEED = 40 // px/s
	const iconOffset = 26
	const overflow = span.scrollWidth - title.offsetWidth + iconOffset
	if (overflow > 0) {
		const MIN_DURATION = 3 // s
		const duration = Math.max(overflow / SPEED, MIN_DURATION)
		span.style.setProperty('--scroll-distance', `${overflow}px`)
		span.style.setProperty('--scroll-duration', `${duration}s`)
		span.classList.add('animated')
	}
}, { flush: 'post' })
</script>

<template>
	<component :is="spotify?.isConnected ? 'a' : 'div'" :class="{spotify__link : spotify?.isConnected}"
			   :href="spotify?.isConnected ? spotify.url : undefined"
			   :target="spotify?.isConnected ? '_blank' : undefined"
			   :rel="spotify?.isConnected ? 'noopener noreferrer' : undefined"
			   class="spotify__pill">
		<div ref="titleEl" class="spotify__pill_title">
			<span ref="spanEl">{{
					spotify?.isConnected ? `${spotify.title} - ${spotify.artist}` : lang === Lang.Fr ? 'Déconnecté' : 'Disconnected'
				}}</span>
		</div>
		<div :class="{'spotify__pill_icon--animated' : spotify?.isConnected ? spotify.isPlaying : false  }"
			 aria-hidden="true"
			 class="spotify__pill_icon">
			<div class="spotify__pill_icon-bar"></div>
			<div class="spotify__pill_icon-bar"></div>
			<div class="spotify__pill_icon-bar"></div>
		</div>
	</component>
</template>

<style lang="scss">
// Registered so the gradient edge color can interpolate during the theme
// transition — a raw var(--background) in a gradient would snap instantly.
@property --spotify-fade {
	syntax: '<color>';
	inherits: false;
	initial-value: transparent;
}

.spotify__pill {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: space(4);
	padding: space(2) space(2) space(2) space(1);
	border: 1px solid var(--accent);
	border-radius: space(10);
	overflow: hidden;
	@include transition(border);

	&_title {
		position: relative;
		overflow: hidden;
		padding-left: space(4);
		flex-grow: 1;

		span {
			display: block;
			font-size: 1.125rem;
			font-weight: 500;
			white-space: nowrap;

			&.animated {
				@media (prefers-reduced-motion: no-preference) {
					animation: var(--scroll-duration) translate 2s linear infinite;
				}
			}
		}

		@keyframes translate {
			0%, 10% {
				transform: translateX(0);
			}
			65%, 75% {
				transform: translateX(calc(-1 * var(--scroll-distance)));
			}
			90%, 100% {
				transform: translateX(0);
			}
		}

		&:before, &:after {
			content: '';
			position: absolute;
			z-index: 1;
			top: 0;
			display: block;
			width: space(3);
			height: 100%;
			--spotify-fade: var(--background);
			transition: --spotify-fade var(--theme-t);
		}

		&:before {
			left: -1px;
			background: linear-gradient(to right, var(--spotify-fade), transparent);
		}

		&:after {
			right: -1px;
			background: linear-gradient(to left, var(--spotify-fade), transparent);
		}
	}

	&_icon {
		border-radius: 50%;
		background: var(--primary);
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: space(1);
		height: 44px;
		width: 44px;

		svg {
			display: block;
		}

		&-dot {
			fill: var(--text);
		}

		&-handle {
			stroke: var(--text);
		}

		&-bar {
			background: var(--background);
			width: 4px;
			height: 4px;
			border-radius: 8px;

			&:nth-child(2) {
				animation-delay: 0.8s;
			}

			&:nth-child(3) {
				animation-delay: 0.4s;
			}
		}

		&--animated .spotify__pill_icon-bar {
			@media (prefers-reduced-motion: no-preference) {
				animation-name: pulse;
				animation-duration: 1s;
				animation-iteration-count: infinite;
				animation-timing-function: linear;
			}
		}

		@keyframes pulse {
			0% {
				height: 4px;
			}
			12.5% {
				height: 8px;
			}
			25% {
				height: 12px;
			}
			37.5% {
				height: 16px;
			}
			50% {
				height: 16px;
			}
			62.5% {
				height: 12px;
			}
			75% {
				height: 8px;
			}
			100% {
				height: 4px;
			}
		}
	}
}

.spotify__link:where(:hover, :focus, :focus-visible) {
	border: 1px solid var(--primary);
}
</style>
