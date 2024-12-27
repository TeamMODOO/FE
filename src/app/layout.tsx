import "@/styles/globals.css";

import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";

import { HomeSideBar } from "@/components";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { AppProviders } from "@/provider";
import { SpoqaHanSansNeo } from "@/styles/font";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={SpoqaHanSansNeo.variable}>
      <body className={cn("font-spoqa-han-sans-neo", "w-full", "h-dvh")}>
        <SessionProvider>
          <SidebarProvider>
            <HomeSideBar />
          </SidebarProvider>
          <AppProviders>{children}</AppProviders>
        </SessionProvider>
      </body>
    </html>
  );
}
