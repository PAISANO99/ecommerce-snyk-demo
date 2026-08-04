import { OrderForm } from "../../src/components/checkout/OrderForm";

describe("OrderForm component testing", () => {
  it("mounts inside CheckoutProvider and validates card fields", () => {
    cy.mount(<OrderForm />, { withCheckoutProvider: true });

    cy.get("#fullName").focus().blur();
    cy.contains("El nombre debe tener al menos 3 caracteres").should("be.visible");

    cy.get("#cardNumber").focus().blur();
    cy.contains("Ingresa una tarjeta válida de 16 dígitos").should("be.visible");
  });

  it("switches to the PayPal branch with the provider-backed form state", () => {
    cy.mount(<OrderForm />, { withCheckoutProvider: true });

    cy.contains("button", "PayPal").click();
    cy.get("#paypal-country").should("be.visible");
    cy.get("#paypal-email").type("correo-invalido").blur();
    cy.contains("Ingresa un correo electrónico válido").should("be.visible");
  });
});
