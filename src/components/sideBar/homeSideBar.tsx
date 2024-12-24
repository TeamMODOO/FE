import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ChatMessages } from "../chat/lobby/chatMessages";
import { FriendInformation } from "./FriendInformation";

export const HomeSideBar = () => {
  return (
    <Sidebar className="h-screen">
      {/* 전체 화면 높이 설정 */}
      <Tabs defaultValue="account" className="size-full">
        <SidebarHeader>
          <TabsList>
            <TabsTrigger value="account">내 정보</TabsTrigger>
            <TabsTrigger value="password">친구 정보</TabsTrigger>
            <TabsTrigger value="settings">전체 채팅</TabsTrigger>
          </TabsList>
        </SidebarHeader>

        <SidebarContent className="h-full overflow-y-auto">
          {/* 스크롤 가능 */}
          <TabsContent value="account">
            <div className="p-4">
              <h3 className="text-lg font-medium">내 정보</h3>
              <p>위 글 지우고 내 정보 관련 컴포넌트가 들어가면 됨</p>
            </div>
          </TabsContent>

          <TabsContent value="password" className="h-full">
            <FriendInformation />
          </TabsContent>

          <TabsContent value="settings">
            <ChatMessages />
          </TabsContent>
        </SidebarContent>
      </Tabs>
    </Sidebar>
  );
};
