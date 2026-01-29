import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell"; // ✅ Import du Shell

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kyntus OS",
  description: "Système de gestion de production Kyntus",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        {/* On délègue toute la logique d'affichage au Shell */}
        <AppShell>
            {children}
        </AppShell>
      </body>
    </html>
  );
}