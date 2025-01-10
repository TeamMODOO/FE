import { ReactNode } from "react";

import { SessionProvider } from "next-auth/react";

import { QueryProvider } from "./query-provider";
import { SocketProvider } from "./socket-provider";

export const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <SessionProvider>
        <SocketProvider>
          <QueryProvider>{children}</QueryProvider>
        </SocketProvider>
      </SessionProvider>
    </>
  );
};
