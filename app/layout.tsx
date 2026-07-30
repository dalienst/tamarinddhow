

import type { Metadata } from "next";
import "./globals.css";
import NextAuthProvider from "@/providers/NextAuthProvider";
import TanstackQueryProvider from "@/providers/TanstackQueryProvider";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Tamarind Dhow Cruises — Premium Swahili Coastal Dining Voyages",
  description: "Embark on an unforgettable coastal cruise aboard the historic Tamarind Dhow. Book premium dining voyages, sunset cruises, Swahili seafood dining, and private events in Mombasa.",
  keywords: "Tamarind Dhow, Mombasa dhow cruise, seafood dining Mombasa, sunset cruise Mombasa, Swahili dhow, Tamarind Mombasa, dhow dinner cruise, coastal voyages Kenya",
  authors: [{ name: "Tamarind Group" }],
  openGraph: {
    title: "Tamarind Dhow Cruises — Premium Swahili Coastal Dining Voyages",
    description: "Embark on an unforgettable coastal cruise aboard the historic Tamarind Dhow. Book premium dining voyages, sunset cruises, Swahili seafood dining, and private events in Mombasa.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tamarind Dhow Cruises — Premium Swahili Coastal Dining Voyages",
    description: "Embark on an unforgettable coastal cruise aboard the historic Tamarind Dhow. Book premium dining voyages, sunset cruises, Swahili seafood dining, and private events in Mombasa.",
  },
};


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
        <Analytics />
      </body>
    </html>
  );
}