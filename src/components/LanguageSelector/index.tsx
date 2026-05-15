import {Select} from '@mantine/core'
import {parseCookies, setCookie} from 'nookies'
import {useTranslation} from 'react-i18next'
import {useEffect} from 'react'

const selectOptions = [
    {label: 'PT', value: 'pt'},
    {label: 'EN', value: 'en'},
    {label: 'ES', value: 'es'},
]

const normalizeLang = (lang: string) => {
    if (lang === 'pt-BR' || lang === 'pt') return 'pt'
    if (lang === 'en' || lang === 'en-US') return 'en'
    if (lang === 'es' || lang === 'es-ES') return 'es'
    return 'pt'
}

const LanguageSelector = () => {
    const {i18n} = useTranslation()
    const {language} = parseCookies()

    const handleChange = () => {
        const locale = 'pt'
        i18n.changeLanguage(locale)
        setCookie(null, 'language', locale, {path: '/'})
        localStorage.setItem('language', locale)
    }

    useEffect(() => {
        const locale = 'pt'
        if (normalizeLang(i18n.language) !== locale) {
            i18n.changeLanguage(locale)
        }
        setCookie(null, 'language', locale, {path: '/'})
        localStorage.setItem('language', locale)
    }, [i18n, language])

    // @ts-ignore
    return (
        <Select
            data={selectOptions}
            value="pt"
            onChange={handleChange}
            disabled
            withinPortal
            size="xs"
            className="ml-6"
            style={{width: 80}}
        />
    )
}

export default LanguageSelector