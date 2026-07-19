import {defineCollection, defineContentConfig} from '@nuxt/content'
import {z} from 'zod'

const stackItem = z.object({
	name: z.string(),
	icon: z.string(),
})

const subExperience = z.object({
	company: z.string(),
	position: z.string(),
	type: z.string(),
	from: z.string(),
	to: z.string(),
	duration: z.string().optional(),
	content: z.string(),
	responsibilities: z.array(z.string()).optional(),
	team: z.string().optional(),
	results: z.array(z.string()).optional(),
	stack: z.array(stackItem),
})

const experience = subExperience.extend({
	sub_content: z.array(subExperience).optional(),
})

const homeSchema = z.object({
	headline_start: z.string(),
	headline_bold: z.string(),
	tagline: z.string(),
	description: z.string(),
	listen: z.string(),
	about: z.string(),
	greetings_text: z.string(),
	about_text: z.string(),
	social: z.string(),
	experience: z.string(),
	contact: z.string(),
	contact_mail: z.string(),
	contact_mail_b64: z.string(),
	contact_phone: z.string(),
	contact_phone_b64: z.string(),
	mission: z.string().optional(),
})

const profileSchema = z.object({
	projects: z.string(),
	resume: z.string(),
	resume_link: z.string(),
	photo: z.string(),
})

const experiencesSchema = z.object({
	items: z.array(experience),
})

const legalSchema = z.object({
	title: z.string(),
	description: z.string(),
})

const projectSchema = z.object({
	order: z.number(),
	title: z.string(),
	type: z.string(),
	description: z.string(),
	git: z.tuple([z.string(), z.string()]).optional(),
	// true when the public repo isn't up yet — renders a "coming soon" pill
	// instead of a (dead) link to a private repo.
	git_soon: z.boolean().optional(),
	web: z.tuple([z.string(), z.string()]).optional(),
	stack: z.array(z.string()),
	// ISO date (YYYY-MM-DD) of the last meaningful content update — surfaced
	// as dateModified in the CreativeWork JSON-LD for freshness signaling.
	updated: z.string().optional(),
})

export default defineContentConfig({
	collections: {
		home_fr: defineCollection({type: 'data', source: 'fr/home.md', schema: homeSchema}),
		home_en: defineCollection({type: 'data', source: 'en/home.md', schema: homeSchema}),

		profile_fr: defineCollection({type: 'data', source: 'fr/profile.md', schema: profileSchema}),
		profile_en: defineCollection({type: 'data', source: 'en/profile.md', schema: profileSchema}),

		experiences_fr: defineCollection({type: 'data', source: 'fr/experiences.md', schema: experiencesSchema}),
		experiences_en: defineCollection({type: 'data', source: 'en/experiences.md', schema: experiencesSchema}),

		// `path` isn't consumed for these — pages/legal.vue is a static file-based
		// route (/legal) regardless of what the collection derives it as.
		legal_fr: defineCollection({type: 'page', source: 'fr/legal.md', schema: legalSchema}),
		legal_en: defineCollection({type: 'page', source: 'en/legal.md', schema: legalSchema}),

		// prefix strips the locale folder from the generated `path` — a file at
		// content/fr/projects/finixa.md resolves to /projects/finixa, matching
		// the identical (locale-free) slug used across both languages.
		projects_fr: defineCollection({
			type: 'page',
			source: {include: 'fr/projects/*.md', prefix: '/projects'},
			schema: projectSchema,
		}),
		projects_en: defineCollection({
			type: 'page',
			source: {include: 'en/projects/*.md', prefix: '/projects'},
			schema: projectSchema,
		}),
	},
})
