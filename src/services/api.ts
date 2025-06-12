import axios, { HttpStatusCode } from 'axios'
const baseURL = process.env.NEXT_PUBLIC_BASE_URL

const api = axios.create({ baseURL: `${baseURL}/` })

api.defaults.headers.post['Content-Type'] = 'application/json'
api.defaults.headers.put['Content-Type'] = 'application/json'
api.defaults.headers.patch['Content-Type'] = 'application/json'
api.defaults.headers.get['Accept'] = 'application/json'
api.defaults.headers.delete['Accept'] = 'application/json'

const LANGUAGES = {
    PT_BR: 'pt-br',
    PT: 'pt',
    EN: 'en',
    ES: 'es',
}

const ACCEPTED_LANGUAGES = Object.values(LANGUAGES)

const ZERO_INDEX = 0

const normalizeLanguage = () => {
    const languageNavigator = String(window.navigator.language).toLowerCase()
    const languagePrefix = languageNavigator.split('-')[ZERO_INDEX]

    if (ACCEPTED_LANGUAGES.includes(languagePrefix)) {
        return languagePrefix == LANGUAGES.PT ? LANGUAGES.PT_BR : languagePrefix
    }

    return LANGUAGES.EN
}

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')

    if (config.headers && token) {
        config.headers.Authorization = `Token ${token}`
        config.headers['Accept-Language'] = normalizeLanguage()
    }

    return config
})

const ROUTES_WITHOUT_TOKEN = ['/login', '/register']

api.interceptors.response.use(
    (response) => {
        return response
    },
    async (error) => {
        if (error.response?.status === HttpStatusCode.Unauthorized) {
            if (ROUTES_WITHOUT_TOKEN.indexOf(window.location.pathname) === -1) {
                localStorage.removeItem('token')
                localStorage.removeItem("user");
                window.location.href = `/login?redirect=${window.location.pathname}`;
            }
        }
        if (error.response?.status === HttpStatusCode.Forbidden) {
            // localStorage.removeItem('token');
            // localStorage.removeItem('user');
            window.location.href = '/403';
            // window.location.href = `/login?redirect=${window.location.pathname}`;
        }

        if (error.response?.status === HttpStatusCode.InternalServerError) {
            console.error('Internal Server Error:', error)
            if (window.location.pathname !== '/500') {
                window.location.href = '/500'
            }
        }

        return Promise.reject(error)
    }
)

export default api
