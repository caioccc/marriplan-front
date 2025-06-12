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
    return 'en'
}

const LanguageSelector = () => {
    const {i18n} = useTranslation()
    const {language} = parseCookies()

    const handleChange = (locale: string) => {
        i18n.changeLanguage(locale)
        setCookie(null, 'language', locale, {path: '/'})
        localStorage.setItem('language', locale)
    }

    useEffect(() => {
        const storedLang = localStorage.getItem('language')
        if (storedLang && normalizeLang(i18n.language) !== normalizeLang(storedLang)) {
            i18n.changeLanguage(storedLang)
        } else if (language && normalizeLang(i18n.language) !== normalizeLang(language)) {
            i18n.changeLanguage(language)
        }
    }, [i18n, language])

    // @ts-ignore
    return (
        <Select
            data={selectOptions}
            value={normalizeLang(i18n.language)}
            onChange={handleChange}
            withinPortal
            size="xs"
            className="ml-6"
            style={{width: 80}}
        />
    )
}

export default LanguageSelector