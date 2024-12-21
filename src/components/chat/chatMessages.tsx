import { Suspense } from "react";

import { ListMessages } from "./listMessages";

export const ChatMessages = async () => {
  return (
    <Suspense fallback={"loading..."}>
      <ListMessages />
    </Suspense>
  );
};
