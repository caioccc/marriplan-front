import axios, { HttpStatusCode } from 'axios'
import { notifications } from '@mantine/notifications'

const baseURL = process.env.NEXT_PUBLIC_BASE_URL
const FIRST_STEPS_REFRESH_EVENT = 'marriplan:first-steps-refresh'
const AUTH_USER_UPDATED_EVENT = 'marriplan:user-updated'

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
    if (typeof window === 'undefined') return LANGUAGES.PT_BR
    const languageNavigator = String(window.navigator.language).toLowerCase()
    const languagePrefix = languageNavigator.split('-')[ZERO_INDEX]

    if (ACCEPTED_LANGUAGES.includes(languagePrefix)) {
        return languagePrefix == LANGUAGES.PT ? LANGUAGES.PT_BR : languagePrefix
    }

    return LANGUAGES.EN
}

api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

    if (config.headers && token) {
        config.headers.Authorization = `Token ${token}`
        config.headers['Accept-Language'] = normalizeLanguage()
    }

    return config
})

const ROUTES_WITHOUT_TOKEN = ['/login', '/register']

const buildLoginRedirectUrl = (pathname: string) => {
    return `/login?redirect=${encodeURIComponent(pathname)}&reason=session_expired`
}

const FIRST_STEPS_MUTATION_PREFIXES = [
    '/api/checklist-tasks/',
    '/api/guests/',
    '/api/gifts/',
    '/api/timeline/',
    '/api/pix-settings/',
    '/api/wedding-suppliers/',
    '/api/parcelas-pagamento/',
    '/api/wedding-profile/',
    '/api/wedding-identity/',
    '/api/wedding-identity/inspirations/',
    '/api/tasks-system/',
]

const shouldRefreshFirstSteps = (method?: string, url?: string) => {
    if (!method || !url) return false

    const normalizedMethod = method.toLowerCase()
    const isMutationMethod = ['post', 'put', 'patch', 'delete'].includes(normalizedMethod)

    if (!isMutationMethod) return false

    const normalizedUrl = url.split('?')[0]
    return FIRST_STEPS_MUTATION_PREFIXES.some((prefix) => normalizedUrl.startsWith(prefix))
}

const dispatchFirstStepsRefresh = () => {
    if (typeof window === 'undefined') return
    window.dispatchEvent(new Event(FIRST_STEPS_REFRESH_EVENT))
}

let lastNotificationTime = 0

api.interceptors.response.use(
    (response) => {
        const responseUser = response.headers?.['x-marriplan-user'] ?? response.headers?.['X-Marriplan-User']

        if (responseUser && typeof window !== 'undefined') {
            try {
                const parsedUser = typeof responseUser === 'string' ? JSON.parse(responseUser) : responseUser
                const nextUserSerialized = JSON.stringify(parsedUser)
                const currentUserSerialized = localStorage.getItem('user')

                if (currentUserSerialized !== nextUserSerialized) {
                    localStorage.setItem('user', nextUserSerialized)
                    window.dispatchEvent(new Event(AUTH_USER_UPDATED_EVENT))
                }
            } catch {
                console.warn('Não foi possível parsear o usuário retornado na resposta da API:', responseUser)
                
            }
        }

        if (shouldRefreshFirstSteps(response.config?.method, response.config?.url)) {
            dispatchFirstStepsRefresh()
        }

        return response
    },
    async (error) => {
        // --- INTERCEPTOR DE FALHA DE CONEXÃO / SERVIDOR OFFLINE ---
        if (!error.response || error.code === 'ERR_NETWORK') {
            const now = Date.now()
            
            if (now - lastNotificationTime > 4000) {
                lastNotificationTime = now
                
                notifications.show({
                    title: 'Servidor temporariamente indisponível',
                    message: 'Não conseguimos nos comunicar com o Marriplan. Alguns dados podem estar desatualizados.',
                    color: 'red',
                    autoClose: 5000,
                    withCloseButton: true,
                    style: { border: '1px solid var(--mantine-color-red-light)' }
                })
            }
            
            // RETORNO NEUTRO RESOLVIDO: Previne que o erro escale para a tela de runtime do Next.js
            // Retorna um fallback seguro mapeado para os diferentes formatos de listagem (arrays e responses paginados)
            return Promise.resolve({
                data: {
                    results: [],
                    count: 0
                }
            })
        }

        // --- Restante dos Interceptors Originais de Status Code ---
        if (error.response?.status === HttpStatusCode.Unauthorized) {
            if (ROUTES_WITHOUT_TOKEN.indexOf(window.location.pathname) === -1) {
                localStorage.removeItem('token')
                localStorage.removeItem("user")
                window.location.href = buildLoginRedirectUrl(window.location.pathname)
            }
        }
        
        if (error.response?.status === HttpStatusCode.Forbidden) {
            window.location.href = '/403'
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