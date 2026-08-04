import AdminOrdersPage from "../../src/modules/admin/pages/AdminOrdersPage";
import AdminProductsPage from "../../src/modules/admin/pages/AdminProductsPage";
import AdminUsersPage from "../../src/modules/admin/pages/AdminUsersPage";
import adminOrders from "../fixtures/admin-orders.json";
import adminProducts from "../fixtures/admin-products.json";
import adminUsers from "../fixtures/admin-users.json";
import categories from "../fixtures/categories.json";

const auth = {
  user: {
    id: 1,
    name: "Javier Gómez",
    email: "javier@vibepulse.com",
    role: "ADMIN" as const,
  },
  token: "admin-test-token",
};

describe("Admin pages with outlet context", () => {
  it("mounts AdminUsersPage with outlet context and mocked API data", () => {
    cy.intercept("GET", "**/api/admin/users*", {
      statusCode: 200,
      body: adminUsers,
    }).as("getAdminUsers");

    cy.mount(<AdminUsersPage />, {
      auth,
      outletContext: { searchQuery: "Javier" },
      routerProps: { initialEntries: ["/admin/users"] },
    });

    cy.wait("@getAdminUsers");
    cy.contains("Javier Gómez").should("be.visible");
    cy.contains(/búsqueda activa/i).should("be.visible");
  });

  it("mounts AdminOrdersPage with outlet context and mocked order responses", () => {
    cy.intercept("GET", "**/api/admin/orders*", {
      statusCode: 200,
      body: adminOrders,
    }).as("getAdminOrders");

    cy.mount(<AdminOrdersPage />, {
      auth,
      outletContext: { searchQuery: "" },
      routerProps: { initialEntries: ["/admin/orders"] },
    });

    cy.wait("@getAdminOrders");
    cy.contains("Historial de pedidos").should("be.visible");
    cy.get("body").should("contain.text", "Javier Gómez");
    cy.get("body").should("contain.text", "Pendiente");
  });

  it("mounts AdminProductsPage with outlet context and mocked catalog responses", () => {
    cy.intercept("GET", "**/api/products*", {
      statusCode: 200,
      body: adminProducts,
    }).as("getProducts");
    cy.intercept("GET", "**/api/categories*", {
      statusCode: 200,
      body: { success: true, data: categories },
    }).as("getCategories");

    cy.mount(<AdminProductsPage />, {
      auth,
      outletContext: { searchQuery: "" },
      routerProps: { initialEntries: ["/admin/products"] },
    });

    cy.wait("@getProducts");
    cy.wait("@getCategories");
    cy.contains("Inventario de productos").should("be.visible");
    cy.get("body").should("contain.text", "Hoodie Pulse");
    cy.contains("button", /nuevo producto/i).should("be.visible");
  });
});
