import {
    assertDashboardHome,
    ensureProfileReady,
    loginViaApi,
    loginViaUi,
    openChecklist,
    openGiftsAndMarketplace,
    openGuests,
} from '../support/flows'
import type { TestUser } from '../support/flows'

const users: TestUser[] = [
    {
        email: 'teste1@gmail.com',
        password: 'Admin123!',
        groomName: 'Teste Um Noivo',
        groomPhone: '11999990001',
        brideName: 'Teste Um Noiva',
        bridePhone: '11999990011',
        weddingDate: '25/12/2026',
        weddingTime: '19:30',
    },
    {
        email: 'teste2@gmail.com',
        password: 'Admin123!',
        groomName: 'Teste Dois Noivo',
        groomPhone: '11999990002',
        brideName: 'Teste Dois Noiva',
        bridePhone: '11999990012',
        weddingDate: '26/12/2026',
        weddingTime: '18:45',
    },
    {
        email: 'teste3@gmail.com',
        password: 'Admin123!',
        groomName: 'Teste Tres Noivo',
        groomPhone: '11999990003',
        brideName: 'Teste Tres Noiva',
        bridePhone: '11999990013',
        weddingDate: '27/12/2026',
        weddingTime: '20:15',
    },
]

describe('Fluxos principais com usuarios de teste', () => {
    it('loga pela interface, completa onboarding quando necessario e abre o checklist', () => {
        const user = users[0]

        loginViaUi(user)
        ensureProfileReady(user)
        assertDashboardHome()
        openChecklist()
    })

    it('entra pela api, valida a dashboard e percorre a lista de presentes', () => {
        const user = users[1]

        loginViaApi(user, '/dashboard')
        ensureProfileReady(user)
        assertDashboardHome()
        openGiftsAndMarketplace()
    })

    it('entra pela api e acessa a area de convidados autenticada', () => {
        const user = users[2]

        loginViaApi(user, '/dashboard')
        ensureProfileReady(user)
        assertDashboardHome()
        openGuests()
    })
})