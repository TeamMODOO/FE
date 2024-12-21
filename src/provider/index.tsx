import { ReactNode } from "react";

import { QueryProvider } from "./query-provider";

export const AppProviders = ({ children }: { children: ReactNode }) => {
  return <QueryProvider>{children}</QueryProvider>;
};
