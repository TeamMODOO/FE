import type { Metadata } from "next";

import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { AppProviders } from "@/provider";
import { QueryProvider } from "@/provider/query-provider";
import { SpoqaHanSansNeo } from "@/styles/font";

import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "정글타워",
  description: "jungle tower",
  icons: {
    icon: "/favicon/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={SpoqaHanSansNeo.variable}>
      <body className={cn("font-spoqa-han-sans-neo", "w-full", "h-dvh")}>
        <QueryProvider>
          <AppProviders>
            {children}
            <Toaster />
          </AppProviders>
        </QueryProvider>
      </body>
    </html>
  );
}
