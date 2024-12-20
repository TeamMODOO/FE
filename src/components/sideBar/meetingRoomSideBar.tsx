import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const MeetingRoomSideBar = () => {
  return (
    <Sidebar>
      <Tabs defaultValue="account" className="w-full">
        <SidebarHeader>
          <TabsList>
            <TabsTrigger value="account">내 정보</TabsTrigger>
            <TabsTrigger value="password">친구 정보</TabsTrigger>
            <TabsTrigger value="settings">전체 채팅</TabsTrigger>
          </TabsList>
        </SidebarHeader>

        <SidebarContent>
          <SidebarContent>
            <TabsContent value="account">
              <div className="p-4">
                <h3 className="text-lg font-medium">내 정보</h3>
                <p>위 글 지우고 내 정보 관련 컴포넌트가 들어가면 됨</p>
              </div>
            </TabsContent>
          </SidebarContent>
        </SidebarContent>
        <SidebarContent>
          <TabsContent value="password">
            <div className="p-4">
              <h3 className="text-lg font-medium">친구 정보</h3>
              <p>위 글 지우고 친구 정보 관련 컴포넌트가 들어가면 됨</p>
            </div>
          </TabsContent>
        </SidebarContent>
        <SidebarContent>
          <TabsContent value="settings">
            <div className="p-4">
              <h3 className="text-lg font-medium">전체 채팅</h3>
              <p>위 글 지우고 전체 채팅 관련 컴포넌트가 들어가면 됨</p>
            </div>
          </TabsContent>
        </SidebarContent>
      </Tabs>
    </Sidebar>
  );
};
