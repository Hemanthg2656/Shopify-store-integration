import "./globals.css";
import { Toaster } from "sonner";

import ReduxProvider from "@/redux/Provider";
import AuthInitializer from "@/components/UI/AuthInitializer";
import AppLayout from "@/components/layouts/AppLayout";

export const metadata = {
  title: "Tryonix",
  description: "Shopify Store Integration",
};

const RootLayout = ({ children }) => {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <AuthInitializer>
            <AppLayout>
              {children}
              <Toaster position="top-right" richColors closeButton />
            </AppLayout>
          </AuthInitializer>
        </ReduxProvider>
      </body>
    </html>
  );
};
export default RootLayout;