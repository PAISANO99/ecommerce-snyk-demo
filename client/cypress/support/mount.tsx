import { mount, type MountOptions, type MountReturn } from "cypress/react";
import type { ReactElement, ReactNode } from "react";
import { MemoryRouter, Outlet, Route, Routes, type MemoryRouterProps } from "react-router-dom";
import { CartProvider } from "../../src/context/CartContext";
import { CheckoutProvider } from "../../src/context/CheckoutContext";
import type { AdminLayoutContext } from "../../src/modules/admin/types";
import { clearAuth, setAuth, type AuthUser } from "../../src/utils/auth";

interface MountAuthOptions {
  token?: string;
  user: AuthUser;
}

export interface MountWithProvidersOptions extends MountOptions {
  auth?: MountAuthOptions;
  outletContext?: AdminLayoutContext;
  routerProps?: MemoryRouterProps;
  withCartProvider?: boolean;
  withCheckoutProvider?: boolean;
}

interface OutletContextBridgeProps {
  outletContext: AdminLayoutContext;
}

function OutletContextBridge({ outletContext }: OutletContextBridgeProps) {
  return <Outlet context={outletContext} />;
}

function wrapWithRouter(component: ReactElement, routerProps: MemoryRouterProps, outletContext?: AdminLayoutContext) {
  if (!outletContext) {
    return <MemoryRouter {...routerProps}>{component}</MemoryRouter>;
  }

  return (
    <MemoryRouter {...routerProps}>
      <Routes>
        <Route element={<OutletContextBridge outletContext={outletContext} />}>
          <Route path="*" element={component} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

function wrapWithProviders(
  component: ReactElement,
  options: Pick<MountWithProvidersOptions, "withCartProvider" | "withCheckoutProvider">
) {
  let wrapped: ReactNode = component;

  if (options.withCartProvider) {
    wrapped = <CartProvider>{wrapped}</CartProvider>;
  }

  if (options.withCheckoutProvider) {
    wrapped = <CheckoutProvider>{wrapped}</CheckoutProvider>;
  }

  return wrapped as ReactElement;
}

export function mountWithProviders(component: ReactElement, options: MountWithProvidersOptions = {}) {
  const {
    auth,
    outletContext,
    routerProps = { initialEntries: ["/"] },
    withCartProvider = false,
    withCheckoutProvider = false,
    ...mountOptions
  } = options;

  window.localStorage.clear();
  window.sessionStorage.clear();

  if (auth) {
    setAuth(auth.user, auth.token ?? "test-token");
  } else {
    clearAuth();
  }

  const withProviders = wrapWithProviders(component, {
    withCartProvider,
    withCheckoutProvider,
  });

  const wrapped = wrapWithRouter(withProviders, routerProps, outletContext);

  return mount(wrapped, mountOptions);
}

declare global {
  namespace Cypress {
    interface Chainable {
      mount(component: ReactElement, options?: MountWithProvidersOptions): Chainable<MountReturn>;
    }
  }
}
