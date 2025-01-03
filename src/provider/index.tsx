import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

import { QueryProvider } from "./query-provider";

export const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <SessionProvider>
        <QueryProvider>{children}</QueryProvider>
      </SessionProvider>
    </>
  );
};
