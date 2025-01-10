import { v4 as uuid } from "uuid";
import { create } from "zustand";

interface ClientIdState {
  clientId: string | null;
  setClientId: (id: string) => void;
  initializeClientId: (sessionUserId: string | undefined) => void;
}

const useClientIdStore = create<ClientIdState>()((set) => ({
  clientId: null,

  setClientId: (id: string) => {
    localStorage.setItem("client_id", id);
    set({ clientId: id });
  },

  initializeClientId: (sessionUserId: string | undefined) => {
    const storedClientId = localStorage.getItem("client_id");
    let newClientId = storedClientId;

    if (!storedClientId) {
      // 저장된 clientId가 없는 경우
      newClientId = sessionUserId || uuid();
    } else if (sessionUserId && storedClientId !== sessionUserId) {
      // 로그인된 사용자의 ID와 저장된 clientId가 다른 경우
      newClientId = sessionUserId;
    }

    if (newClientId) {
      localStorage.setItem("client_id", newClientId);
      set({ clientId: newClientId });
    }
  },
}));

export default useClientIdStore;
