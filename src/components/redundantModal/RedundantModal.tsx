"use client";

import { useIsConnectionsStore } from "@/store/useIsConnectionsStore";

import AlertModal from "../alertModal/AlertModal";

const RedundantModal = () => {
  const { isConnections, setIsConnections } = useIsConnectionsStore();

  if (!isConnections) return;
  return (
    <AlertModal
      title="다른 기기에서 접속이 감지되었습니다"
      onClose={() => setIsConnections(false)}
      noCloseBtn={true}
    >
      <p>
        보안과 데이터 보호를 위해 한 계정은 동시에 하나의 기기에서만 접속이
        가능합니다.
      </p>
      <p>계속 이용을 원하시면 다른 기기에서 로그아웃 후 다시 시도해 주세요.</p>
    </AlertModal>
  );
};

export default RedundantModal;
