import { ChatInput } from "@/components/chat/chatInput";
import { ChatMessages } from "@/components/chat/chatMessages";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";

export const MeetingRoomSideBar = () => {
  return (
    <Sidebar side={"left"}>
      <SidebarHeader>회의실 채팅</SidebarHeader>
      <div className=" h-screen pb-10 pt-5">
        <div className="relative flex h-full flex-col rounded-md ">
          <SidebarContent>
            <ChatMessages />
            <ChatInput />
          </SidebarContent>
        </div>
      </div>
    </Sidebar>
  );
};
