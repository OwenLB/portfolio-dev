// Duration computed from the localized "from"/"to" strings of an experience
// ("Septembre 2023", "May 2025", "Aujourd'hui"/"Now"…). Used as a fallback
// when the content doesn't hardcode one — ongoing positions stay accurate
// forever. Convention matches the existing content: inclusive month count
// (Juin 2021 — Juillet 2021 → "(2 mois)").
const MONTHS: Record<string, number> = {
	janvier: 0, january: 0, février: 1, february: 1, mars: 2, march: 2,
	avril: 3, april: 3, mai: 4, may: 4, juin: 5, june: 5, juillet: 6, july: 6,
	août: 7, august: 7, septembre: 8, september: 8, octobre: 9, october: 9,
	novembre: 10, november: 10, décembre: 11, december: 11,
}

function parseMonthDate(value?: string): Date | null {
	if (!value) return null
	if (/aujourd|now|today/i.test(value)) return new Date()
	const year = value.match(/\d{4}/)?.[0]
	if (!year) return null
	const month = Object.entries(MONTHS).find(([name]) => value.toLowerCase().includes(name))?.[1] ?? 0
	return new Date(Number(year), month, 1)
}

export function formatDuration(from?: string, to?: string, lang: string = 'fr'): string {
	const start = parseMonthDate(from)
	const end = parseMonthDate(to)
	if (!start || !end) return ''
	const months = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth() + 1
	if (months <= 0) return ''
	const fr = lang === 'fr'
	const years = Math.floor(months / 12)
	const rest = months % 12
	if (!years) return fr ? `(${months} mois)` : `(${months} month${months > 1 ? 's' : ''})`
	const yearPart = fr ? `${years} an${years > 1 ? 's' : ''}` : `${years} year${years > 1 ? 's' : ''}`
	const restPart = rest ? (fr ? ` ${rest} mois` : ` ${rest} month${rest > 1 ? 's' : ''}`) : ''
	return `(${yearPart}${restPart})`
}
