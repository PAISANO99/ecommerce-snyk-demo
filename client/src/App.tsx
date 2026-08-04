import { CartProvider } from "./context/CartContext";
import { CheckoutProvider } from "./context/CheckoutContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <CartProvider>
      <CheckoutProvider>
        <AppRoutes />
      </CheckoutProvider>
    </CartProvider>
  );
}

export default App;
