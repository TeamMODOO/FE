import useMainSocketConnect from "@/hooks/socket/useMainSocketConnect";

import MyRoomCanvas from "./_component/Canvas/Canvas";

export default function Page() {
  useMainSocketConnect();
  return <MyRoomCanvas></MyRoomCanvas>;
}
