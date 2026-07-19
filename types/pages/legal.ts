export interface Legal {
	title: string
	description: string
	// Markdown body AST (Nuxt Content v3 page-type document) — rendered as-is
	// via <ContentRenderer :value="content">.
	body?: unknown
}