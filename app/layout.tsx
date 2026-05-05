import "./globals.css";
import NextAuthProvider from "@/providers/NextAuthProvider";
import TanstackQueryProvider from "@/providers/TanstackQueryProvider";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              borderRadius: "8px",
              background: "#1D1D1F",
              color: "#FFFFFF",
              fontSize: "14px",
            },
          }}
        />
        <NextAuthProvider>
          <TanstackQueryProvider>{children}</TanstackQueryProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}