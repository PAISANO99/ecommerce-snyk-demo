import App from "../../src/App";

describe("App component testing", () => {
  it("renders the login route shell inside the router context", () => {
    cy.mount(<App />, {
      routerProps: { initialEntries: ["/login"] },
    });

    cy.contains(/ingresa tus credenciales para continuar tu experiencia/i).should("be.visible");
    cy.get("#login-email").should("be.visible");
    cy.get("#login-password").should("be.visible");
    cy.contains("button", /iniciar sesión/i).should("be.visible");
  });
});
