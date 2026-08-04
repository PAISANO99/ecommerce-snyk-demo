import CatalogFilters from "../../src/components/catalog/CatalogFilters";
import ProductGrid from "../../src/components/catalog/ProductGrid";
import DashboardCard from "../../src/layouts/DashboardCard";
import categories from "../fixtures/categories.json";
import products from "../fixtures/products.json";

describe("Data-driven components", () => {
  it("renders catalog filters with explicit category fixtures", () => {
    const onFilterChange = cy.stub().as("onFilterChange");

    cy.mount(
      <CatalogFilters
        categories={categories}
        filters={{ search: "", featured: undefined }}
        onFilterChange={onFilterChange}
      />
    );

    cy.contains("button", "Remeras").click();
    cy.get("@onFilterChange").should("have.been.calledWith", { categoryId: 1 });
    cy.get("#catalog-filter-search").type("h");
    cy.get("@onFilterChange").should("have.been.calledWith", { search: "h" });
  });

  it("renders a stable product grid with fixture-based props", () => {
    cy.mount(<ProductGrid products={products} />);

    cy.contains("Hoodie Pulse").should("be.visible");
    cy.contains("Cargo Motion").should("be.visible");
    cy.get("button").then(($buttons) => {
      const detailButtons = [...$buttons].filter((button) => button.textContent?.includes("Ver detalle"));
      expect(detailButtons).to.have.length(products.length);
    });
  });

  it("renders the empty product state without crashing", () => {
    cy.mount(<ProductGrid products={[]} emptyMessage="Sin productos en catálogo" />);

    cy.contains("Sin productos en catálogo").should("be.visible");
  });

  it("renders dashboard cards with explicit userInfo props", () => {
    cy.mount(
      <DashboardCard
        title="Panel cliente"
        subtitle="Resumen de sesión"
        userInfo={[
          { label: "Nombre", value: "Javier Gómez" },
          { label: "Rol", value: "ADMIN" },
        ]}
        onLogout={cy.stub().as("onLogout")}
      />
    );

    cy.contains("Panel cliente").should("be.visible");
    cy.contains("Javier Gómez").should("be.visible");
    cy.contains("button", /cerrar sesión/i).click();
    cy.get("@onLogout").should("have.been.calledOnce");
  });
});
