// Submits every URL in the generated sitemaps to IndexNow (Bing/Yandex — no
// equivalent needed for Google, which doesn't support the protocol).
// Run manually after a deploy: `npm run indexnow`. Not wired into the build
// itself on purpose — it calls a third-party API, so it stays an explicit,
// reviewable step rather than a silent side effect of every `npm run generate`.
import {readFile} from 'node:fs/promises'

const HOST = 'owenlebec.fr'
const KEY = '50cc8117914f970d6b1fada8ec342b2b'
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`
const SITEMAP_FILES = [
	'.output/public/__sitemap__/fr-FR.xml',
	'.output/public/__sitemap__/en-US.xml',
]

async function extractUrls(path) {
	const xml = await readFile(path, 'utf-8')
	return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1])
}

const urlLists = await Promise.all(SITEMAP_FILES.map(extractUrls))
const urlList = [...new Set(urlLists.flat())]

if (urlList.length === 0) {
	console.error('No URLs found — run `npm run generate` first.')
	process.exit(1)
}

console.log(`Submitting ${urlList.length} URLs to IndexNow…`)

const response = await fetch('https://api.indexnow.org/indexnow', {
	method: 'POST',
	headers: {'Content-Type': 'application/json; charset=utf-8'},
	body: JSON.stringify({host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList}),
})

if (response.ok) {
	console.log(`Done (HTTP ${response.status}).`)
} else {
	console.error(`IndexNow rejected the submission: HTTP ${response.status} ${await response.text()}`)
	process.exit(1)
}
