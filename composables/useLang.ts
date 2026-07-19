// Language state is now owned by @nuxtjs/i18n (URL-driven, cookie-persisted).
// useLang() returns the active locale ref ('fr' | 'en') so existing call sites
// keep working — the Lang enum values map 1:1 onto the i18n locale codes.
export default () => {
	const {locale} = useI18n()
	return locale
}
