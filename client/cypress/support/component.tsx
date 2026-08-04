import "../../src/index.css";
import { mountWithProviders } from "./mount";

Cypress.Commands.add("mount", mountWithProviders);
