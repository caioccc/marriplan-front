/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { LoadingProgress } from '@/components/LoadingProgress'
import { AxiosRequestConfig } from 'axios'
import { useRouter } from 'next/router'
import { destroyCookie } from 'nookies'
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react'
import {
    LoginFormData,
    LoginResponse,
    RegisterFormData,
    UserData
} from '../interfaces/common'
import api from '../services/api'

const unprotectedRoutes = [
    '/login',
    '/register',
    '/404',
    '/403',
    '/500',
    '/register/check-email',
    '/register/confirm-email',
    '/register/confirm-email/[key]',
    '/reset-password',
    '/reset-password/[token]',
    '/2fa',
    '/site/[slug]',
    '/gifts/share/[token]'
]

type AuthProviderProps = {
    children: React.ReactNode
}

type IAuthContext = {
    isAuthenticated: boolean
    loading: boolean
    user?: UserData
    setUser: (newUser: any) => void
    login: (body: LoginFormData) => Promise<any>
    logout: () => void
    register: (body: RegisterFormData) => Promise<any>
    refreshUser: () => Promise<void>
}


const isExternalPage = (path: string) => {
    return !!unprotectedRoutes.find((route) =>
        path.startsWith(route.replaceAll('[key]', ''))
    )
}

const defaultAuthContextValues: IAuthContext = {
    isAuthenticated: false,
    loading: true,
    user: undefined,
    setUser: (newUser: any) => {
        return undefined
    },
    login: async () => {
        return undefined
    },
    logout: () => {
        return undefined
    },
    register: async () => {
        return undefined
    },
    refreshUser: async () => {
        return undefined
    },
}

const AuthContext = createContext<IAuthContext>(defaultAuthContextValues)

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<any>()
    const [loading, setLoading] = useState(true)

    const router = useRouter()

    const loadUserFromCookies = useCallback(async () => {
        try {
            const token = localStorage.getItem('token')
            const userSaved = localStorage.getItem('user')
            if (token && userSaved) {
                setLoading(false)
                setUser(JSON.parse(userSaved))
                // Keep current route; route guards will handle redirects.
            } else {
                setLoading(false)
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                localStorage.removeItem('settings')
                router.push(`/login?redirect=${router.route}`)
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            setLoading(false)
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            localStorage.removeItem('settings')
            router.push(`/login?redirect=${router.route}`)
        }
    }, [])


    useEffect(() => {
        if (!isExternalPage(router.pathname)) {
            loadUserFromCookies()
        } else {
            setLoading(false)
        }
    }, [])

    const refreshUser = useCallback(async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                setUser(undefined)
                return
            }
            const config = {
                headers: {
                    Authorization: `Token ${token}`,
                },
            } as AxiosRequestConfig

            const { data } = await api.get<UserData>('/api/auth/user/', config)

            if (data) {
                setUser(data)
                localStorage.setItem('user', JSON.stringify(data))
            }
        } catch (error) {
            console.error('Error refreshing user:', error)
            setUser(undefined)
        }
    });


    const login = async (body: LoginFormData) => {
        const config = {
            headers: {},
        } as AxiosRequestConfig

        const { data } = await api.post<LoginResponse>(
            '/api/auth/pre-login/',
            body,
            config
        )

        if (data.token) {
            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))
            localStorage.setItem('local_user', JSON.stringify(data.local_user))
            setUser(data.user)
        }

        return data
    }

    const register = async (body: RegisterFormData) => {
        const config = {
            headers: {},
        } as AxiosRequestConfig

        const { data } = await api.post(
            '/api/auth/register/',
            body,
            config
        )
        return data
    }

    const logout = () => {
        setUser(undefined)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('local_user')
        destroyCookie(null, 'redirect_route')
    }

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated: !!user,
                user,
                setUser,
                login,
                loading,
                logout,
                register,
                refreshUser
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)

type ProtetedRouteProps = {
    children: React.ReactNode
}

export const ProtectedRoute = ({
    children,
}: ProtetedRouteProps) => {
    const router = useRouter()
    const { isAuthenticated, loading, user } = useAuth()

    const onboardingRoute = '/onboarding'

    const isWeddingProfileComplete = (profile?: any) => {
        if (!profile) return false
        return !!(
            profile.nome_noivo &&
            profile.telefone_noivo &&
            profile.nome_noiva &&
            profile.telefone_noiva &&
            profile.data_casamento &&
            profile.hora_casamento &&
            profile.local
        )
    }

    const pathIsProtected = !(unprotectedRoutes.indexOf(router.pathname) !== -1)

    useEffect(() => {
        if (!isAuthenticated && !loading && pathIsProtected) {
            router.push(`/login?redirect=${router.route}`)
            return
        }

        if (!loading && isAuthenticated && pathIsProtected) {
            const needsOnboarding = !isWeddingProfileComplete(user?.wedding_profile)

            if (needsOnboarding && router.pathname !== onboardingRoute) {
                router.push(onboardingRoute)
            }
        }
    }, [isAuthenticated, loading, pathIsProtected, router.pathname, user])

    if ((loading || !isAuthenticated) && pathIsProtected) {
        return (
            <div className="flex justify-center items-center h-screen">
                <LoadingProgress />
            </div>
        )
    }

    return <>{children}</>
}
