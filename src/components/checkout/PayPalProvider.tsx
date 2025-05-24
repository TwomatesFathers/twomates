import { ReactNode } from 'react';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

interface PayPalProviderProps {
  children: ReactNode;
}

const PayPalProvider = ({ children }: PayPalProviderProps) => {
  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
  const environment = import.meta.env.VITE_PAYPAL_ENVIRONMENT || 'sandbox';

  if (!clientId) {
    console.warn('PayPal client ID not found. PayPal integration will be disabled.');
    return <>{children}</>;
  }

  const initialOptions = {
    clientId: clientId,
    "client-id": clientId,
    currency: "USD",
    intent: "capture",
    "data-client-token": undefined,
    environment: environment as "sandbox" | "production",
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      {children}
    </PayPalScriptProvider>
  );
};

export default PayPalProvider; 