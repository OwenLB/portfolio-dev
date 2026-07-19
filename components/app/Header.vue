<script lang="ts" setup>
import {Theme} from "~/types/theme";
import {Lang} from "~/types/lang";

enum Toggle {
	Theme = 'theme',
	Lang = 'lang',
}

const theme = useTheme()
const lang = useLang()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
// Knob position follows the active locale (set by the URL after navigation).
const switchState = computed(() => lang.value !== Lang.Fr)

const toggle = (event: Event, type: Toggle) => {
	const {currentTarget} = event
	;(currentTarget as HTMLInputElement).blur()

	if (type === Toggle.Theme) {
		switchTheme(event as MouseEvent)
	} else if (type === Toggle.Lang) {
		// Switching language is now a real navigation to the localized URL
		// (/ ⇄ /en); the page transition plays the curtain animation for us.
		navigateTo(switchLocalePath(lang.value === Lang.Fr ? Lang.En : Lang.Fr))
	}
}

// Theme switch as a circular reveal expanding from the toggle button
// (View Transition + clip-path). Falls back to the plain crossfade
// (--theme-t transitions) without API support or under reduced motion.
const switchTheme = (event: MouseEvent) => {
	const next = theme.value === Theme.Dark ? Theme.Light : Theme.Dark
	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

	if (!document.startViewTransition || reduced) {
		theme.value = next
		return
	}

	// Keyboard activation has no pointer coords (detail === 0) — expand from
	// the button itself.
	let {clientX: x, clientY: y} = event
	if (event.detail === 0) {
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
		x = rect.left + rect.width / 2
		y = rect.top + rect.height / 2
	}

	const root = document.documentElement
	// .theme-vt zeroes --theme-t and the default crossfade so the circle is
	// the only animation (see app.vue).
	root.classList.add('theme-vt')
	const transition = document.startViewTransition(async () => {
		theme.value = next
		await nextTick()
	})
	transition.ready.then(() => {
		const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
		root.animate(
			{clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`]},
			{duration: 550, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', pseudoElement: '::view-transition-new(root)'},
		)
	}).catch(() => {})
	// The theme itself is applied synchronously in the callback — if the
	// browser aborts the transition (slow DOM update), only the circle is
	// lost. Swallow every rejection path so an abort never hits the console.
	transition.updateCallbackDone.catch(() => {})
	transition.finished.finally(() => root.classList.remove('theme-vt')).catch(() => {})
}
</script>

<template>
	<header role="banner">
		<div class="cell">
		</div>
		<div class="cell name">
			<NuxtLink :aria-label="lang === Lang.Fr ? 'Retour à la page d\'accueil' : 'Back to homepage'" :to="localePath('/')">
				<AppIcon icon="logo"/>
        <span>Owen LE BEC</span>
			</NuxtLink>
		</div>
		<div class="cell cell--desktop">
		</div>
		<div class="cell control">
			<button :aria-checked="switchState" :aria-label="lang === Lang.Fr ? 'Changer de langue' : 'Change language'"
					class="control__lang" role="switch" type="button"
					@click.stop="toggle($event,Toggle.Lang)">
				<span :class="{current: lang === Lang.Fr}" class="control__lang_side">FR</span>
				<span class="control__lang_switch">
					<span></span>
				</span>
				<span :class="{current: lang === Lang.En}" class="control__lang_side">EN</span>
			</button>
			<button
				:aria-label="lang === Lang.Fr ? 'Changer le theme de couleurs' : 'Change color theme'"
				:class="{ 'is-dark': theme === Theme.Dark }"
				class="control__theme"
				type="button"
				@click.stop="toggle($event,Toggle.Theme)"
			>
				<span aria-hidden="true" class="sun-moon">
					<span v-for="n in 8" :key="n" :style="{ '--n': n }" class="sun-moon__ray"/>
				</span>
			</button>
		</div>
		<div class="cell">
		</div>
	</header>
</template>

<style lang="scss">
header {
	display: contents;

	.cell {
		&.name, &.control {
			display: flex;
			align-items: center;
			font-size: 1.125rem;
			font-weight: 500;
			padding: space(2) var(--main-space);
		}

		&.name {
			a {
				display: flex;
				align-items: center;
				gap: space(4);
				@include transition(color);

				span {
					display: none;
				}

				&:where(:hover, :focus, :focus-visible) {
					color: var(--primary);
				}
			}
		}

		&.control {
			justify-content: space-between;
			// Narrow cell on mobile: tighter padding + gaps so FR/switch/EN and
			// the theme toggle never overlap (desktop restores them below).
			padding-inline: space(3);
			gap: space(2);

			.control__lang {
				all: unset;
				display: flex;
				align-items: center;
				gap: space(2);
				cursor: pointer;
				padding: space(2) 0;

				&_side {
					font-family: var(--font-mono);
					font-size: 0.875rem;
					opacity: 0.35;
					transition: color 0.3s, opacity 0.3s;

					&.current {
						color: var(--primary);
						opacity: 1;
					}
				}

				&_switch {
					display: block;
					width: space(12);
					padding: space(2);
					border-radius: space(4);
					border: 1px solid var(--accent);
					transition: border-color var(--theme-t);

					span {
						display: block;
						width: space(3);
						height: space(3);
						border-radius: 50%;
						background: var(--primary);
						@include transition(transform);
					}
				}

				&:where(:hover, :focus, :focus-visible) {
					.control__lang_switch {
						border: 1px solid var(--primary);
					}
				}

				&[aria-checked="true"] {
					.control__lang_switch {
						span {
							transform: translateX(space(4) + 2);
						}
					}
				}
			}

			.control__theme {
				all: unset;
				cursor: pointer;
				display: flex;
				align-items: center;
				@include transition(color);

				&:where(:hover, :focus, :focus-visible) {
					color: var(--primary);
				}

				// default = light mode → moon (action: go dark)
				.sun-moon {
					position: relative;
					display: block;
					width: 14px;
					height: 14px;
					border-radius: 50%;
					background: currentColor;
					transform-origin: center;
					transition: transform 0.75s ease-in-out;

					&::after {
						content: '';
						position: absolute;
						width: 12px;
						height: 12px;
						border-radius: 50%;
						background: var(--background);
						left: 6px;
						bottom: 3px;
						transition: transform 0.5s ease, left 0.25s ease, bottom 0.25s ease, background-color var(--theme-t);
					}

					&__ray {
						position: absolute;
						top: 5px;
						left: 5px;
						width: 4px;
						height: 4px;
						border-radius: 50%;
						background: currentColor;
						transform-origin: center;
						transform: rotate(calc((var(--n) - 1) * 45deg)) translateX(0);
						transition: transform 0.5s ease-in-out;
					}
				}

				// .is-dark = dark mode → sun (action: go light)
				&.is-dark .sun-moon {
					transform: scale(0.65);

					&::after {
						left: 12px;
						bottom: 6px;
						transform: scale(0);
					}

					&__ray {
						transform: rotate(calc((var(--n) - 1) * 45deg)) translateX(-13px);
					}
				}
			}
		}
	}
}

@media screen and (min-width: $md) {
	header {
		.cell {
			&.name {
				a span {
					display: block;
				}
			}

			&.control {
				padding-inline: var(--main-space);
				gap: space(4);

				.control__lang {
					gap: space(4);
				}

				.control__lang_side {
					font-size: 1rem;
				}
			}
		}
	}
}
</style>
