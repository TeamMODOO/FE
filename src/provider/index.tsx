import { ReactNode } from "react";

import { SidebarProvider } from "@/components/ui/sidebar";

import { QueryProvider } from "./query-provider";

export const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <QueryProvider>
      <SidebarProvider>{children} </SidebarProvider>
    </QueryProvider>
  );
};
