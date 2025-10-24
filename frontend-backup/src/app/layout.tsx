import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ascend Protocol - Crypto Inheritance Made Simple",
  description: "India's first crypto inheritance protocol. Secure your digital assets with our innovative dead man switch infrastructure.",
  keywords: "crypto inheritance, blockchain, digital assets, India, UPI, dead man switch",
  authors: [{ name: "Ascend Protocol Team" }],
  openGraph: {
    title: "Ascend Protocol - Crypto Inheritance Made Simple",
    description: "India's first crypto inheritance protocol. Secure your digital assets with our innovative dead man switch infrastructure.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}