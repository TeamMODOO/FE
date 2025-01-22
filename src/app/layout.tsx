import type { Metadata } from "next";

import PrefetchManager from "@/components/PrefetchManager";
import RedundantModal from "@/components/redundantModal/RedundantModal";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { AppProviders } from "@/provider";
import { DungGeunMo, NotoSerifKR, SpoqaHanSansNeo } from "@/styles/font";

import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "정글타워",
  description: "jungle tower",
  icons: {
    icon: "/favicon/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${SpoqaHanSansNeo.variable} ${NotoSerifKR.variable} ${DungGeunMo.variable}`}
    >
      <body
        className={cn(
          "[font-family:var(--font-dung-geun-mo),serif]",
          "w-full",
          "h-dvh",
        )}
      >
        <PrefetchManager />
        <AppProviders>
          {children}
          <Toaster />
          <RedundantModal />
        </AppProviders>
      </body>
    </html>
  );
}
