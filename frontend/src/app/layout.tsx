import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import { TransitionProvider } from "@/components/providers/TransitionProvider";
import { LanguageProvider } from "@/components/providers/LanguageProvider"; // ✅ ZID HADI

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kyntus OS",
  description: "Système de gestion de production Kyntus",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <LanguageProvider> {/* ✅ WRAP KAMEL */}
            <TransitionProvider>
                <AppShell>
                    {children}
                </AppShell>
            </TransitionProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}