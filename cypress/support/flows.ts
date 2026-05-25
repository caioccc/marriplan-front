type AuthPayload = {
    token: string
    user: Record<string, unknown>
    local_user?: Record<string, unknown>
}

export type TestUser = {
    email: string
    password: string
    groomName: string
    groomPhone: string
    brideName: string
    bridePhone: string
    weddingDate: string
    weddingTime: string
}

const apiBaseUrl = Cypress.env('API_BASE_URL') || 'http://localhost:8000'

const setAuthStorage = (win: Window, auth: AuthPayload) => {
    win.localStorage.setItem('token', auth.token)
    win.localStorage.setItem('user', JSON.stringify(auth.user))

    if (auth.local_user) {
        win.localStorage.setItem('local_user', JSON.stringify(auth.local_user))
    }
}

const typeByLabel = (label: string, value: string) => {
    cy.contains('label', label)
        .should('be.visible')
        .then(($label) => {
            const fieldId = $label.attr('for')

            if (!fieldId) {
                throw new Error(`Nao foi possivel localizar o campo "${label}".`)
            }

            cy.get(`[id="${fieldId}"]`)
                .should('be.visible')
                .clear()
                .type(value)
        })
}

const typeLoginCredentials = (email: string, password: string) => {
    cy.get('input[type="email"]')
        .should('be.visible')
        .clear()
        .type(email)

    cy.get('input[type="password"]')
        .should('be.visible')
        .clear()
        .type(password)
}

export const loginViaUi = (user: TestUser) => {
    cy.visit('/login')
    typeLoginCredentials(user.email, user.password)
    cy.get('button[type="submit"]').should('be.enabled').click()
}

export const loginViaApi = (user: TestUser, path = '/dashboard') => {
    cy.request<AuthPayload>({
        method: 'POST',
        url: `${apiBaseUrl}/api/auth/pre-login/`,
        body: {
            email: user.email,
            password: user.password,
        },
    }).then(({ body }) => {
        if ((body as { require_2fa?: boolean }).require_2fa) {
            throw new Error(`O usuario ${user.email} exige 2FA e nao pode ser usado neste fluxo.`)
        }

        cy.visit(path, {
            onBeforeLoad(win) {
                setAuthStorage(win, body)
            },
        })
    })
}

const completeOnboarding = (user: TestUser) => {
    cy.location('pathname', { timeout: 30000 }).then((pathname) => {
        if (pathname !== '/onboarding') {
            return
        }

        typeByLabel('Nome do noivo', user.groomName)
        typeByLabel('Telefone do noivo', user.groomPhone)

        cy.contains('button', 'Proximo').should('not.be.disabled').click()

        typeByLabel('Nome da noiva', user.brideName)
        typeByLabel('Telefone da noiva', user.bridePhone)

        cy.contains('button', 'Proximo').should('not.be.disabled').click()

        typeByLabel('Data do casamento', user.weddingDate)
        cy.contains('label', 'Data do casamento')
            .should('be.visible')
            .then(($label) => {
                const fieldId = $label.attr('for')

                if (!fieldId) {
                    throw new Error('Nao foi possivel localizar o campo "Data do casamento".')
                }

                cy.get(`[id="${fieldId}"]`).blur()
            })

        typeByLabel('Hora do casamento', user.weddingTime)
        cy.contains('label', 'Hora do casamento')
            .should('be.visible')
            .then(($label) => {
                const fieldId = $label.attr('for')

                if (!fieldId) {
                    throw new Error('Nao foi possivel localizar o campo "Hora do casamento".')
                }

                cy.get(`[id="${fieldId}"]`).blur()
            })

        cy.contains('button', 'Proximo').should('not.be.disabled').click()

        cy.contains('button', 'Salvar').should('be.enabled').click()
        cy.url({ timeout: 30000 }).should('include', '/dashboard')
    })
}

export const ensureProfileReady = (user: TestUser) => {
    cy.location('pathname', { timeout: 30000 }).should('match', /\/(dashboard|onboarding)$/)

    completeOnboarding(user)

    cy.url({ timeout: 30000 }).should('include', '/dashboard')
}

export const assertDashboardHome = () => {
    cy.contains('Seu momento especial', { timeout: 30000 }).should('be.visible')
    cy.contains('Proximos passos').should('be.visible')
    cy.contains('Convidados recentes').should('be.visible')
    cy.contains('Presentes recentes').should('be.visible')
}

export const openChecklist = () => {
    cy.contains('button', 'Ver checklist').should('be.visible').click()
    cy.url({ timeout: 30000 }).should('include', '/checklist')
    cy.contains('Checklist de Casamento', { timeout: 30000 }).should('be.visible')
}

export const openGiftsAndMarketplace = () => {
    cy.visit('/gifts')
    cy.contains('Lista de Presentes', { timeout: 30000 }).should('be.visible')
    cy.contains('Ir ao marketplace').should('be.visible').click()
    cy.url({ timeout: 30000 }).should('include', '/gifts/marketplace')
    cy.contains('Marketplace de Produtos', { timeout: 30000 }).should('be.visible')
    cy.contains('Buscar produtos').should('be.visible')
}

export const openGuests = () => {
    cy.visit('/guests')
    cy.contains('Meus Convidados', { timeout: 30000 }).should('be.visible')
    cy.contains('Adicionar convidado').should('be.visible')
}