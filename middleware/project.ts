// Projects exist in both locales (parallel fr/en folders), so checking the FR
// collection is enough — the slug param is identical across /projects and
// /en/projects, and this keeps the middleware out of the i18n locale lifecycle.
export default defineNuxtRouteMiddleware(async (to) => {
	const doc = await queryCollection('projects_fr').path('/projects/' + to.params.slug).first()
	if (!doc) return abortNavigation()
})
