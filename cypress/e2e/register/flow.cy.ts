import { defaultInterceptors } from "../../interceptors/dashboard";

describe("Teste de Fluxo de Registro", () => {
  beforeEach(() => {
    defaultInterceptors();
    cy.visit("http://localhost:3000/login");
    cy.wait(1000);
  });

  it("Realiza registro na plataforma", () => {
    cy.get(".test-button-register").click();
    cy.wait(2000);
    cy.get(".username").type("testuser");
    cy.get(".email").type("emailteste@gmail.com");
    cy.get(".password").type("Admin123!");
    cy.get(".confirmpassword").type("Admin123!");
    cy.get(".test-button").click();

    cy.wait("@register");

    cy.url().should("include", "/login");
  });

  it("Realiza login na plataforma", () => {
    cy.get(".test-button-register").click();
    cy.wait(2000);
    cy.get(".username").type("testuser");
    cy.get(".email").type("emailteste@gmail.com");
    cy.get(".password").type("Admin123!");
    cy.get(".confirmpassword").type("Admin123!");
    cy.get(".test-button").click();

    cy.wait("@register");

    cy.url().should("include", "/login");

    cy.get(".username").type("testuser");
    cy.get(".password").type("Admin123!");
    cy.get(".test-button").click();

    cy.wait("@login");

    cy.url().should("include", "/tasks");
  });
});
