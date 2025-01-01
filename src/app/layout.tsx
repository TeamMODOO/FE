import "@/styles/globals.css";

import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";

import { cn } from "@/lib/utils";
import { AppProviders } from "@/provider";
import { SpoqaHanSansNeo } from "@/styles/font";

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
        <AppProviders>
          {children}
          <Toaster position="top-center" reverseOrder={false} />
        </AppProviders>
      </body>
    </html>
  );
}
