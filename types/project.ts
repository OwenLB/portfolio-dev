export interface Project {
	path: string
	title: string
	type: string
	description: string
	git?: [string, string]
	// true when the public repo isn't up yet — renders a "coming soon" pill
	// instead of a (dead) link to a private repo.
	git_soon?: boolean
	web?: [string, string]
	stack: string[]
	// ISO date (YYYY-MM-DD) of the last meaningful content update — surfaced as
	// dateModified in the CreativeWork JSON-LD for freshness signaling.
	updated?: string
	// Markdown body AST (Nuxt Content v3 page-type document) — rendered as-is
	// via <ContentRenderer :value="content">.
	body?: unknown
}