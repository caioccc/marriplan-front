import { defaultInterceptors } from "../interceptors/dashboard"

export function loginRoutine() {
    defaultInterceptors()

    cy.visit('http://localhost:3000/login')
    cy.wait(250)
    cy.get('.username').type('testuser')
    cy.get('.password').type('Admin123!')
    cy.get('.test-button').click()

    cy.wait('@login')
    cy.wait(1000)
    cy.url().should('include', '/tasks')

    cy.wait(1000)


}
