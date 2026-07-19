<script lang="ts" setup>
// Legacy route — About is a section on the home page, not a standalone page.
// Netlify issues a real 301 for /about and /en/about (netlify.toml) before this
// ever runs; this middleware only matters as a fallback (e.g. local dev), so it
// must still land on the *current locale's* home, not hardcode the French one.
definePageMeta({
	middleware: () => navigateTo(useLocalePath()('/'), {replace: true})
})
</script>

<template>
	<div></div>
</template>
