import { MessageCircle, Send, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState("");

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      setMessages([...messages, inputMessage]);
      setInputMessage("");
    }
  };

  return (
    <div className="fixed bottom-4 left-4">
      {isOpen && (
        <Card className="mb-4 flex h-96 w-80 flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <h3 className="font-semibold">Chat</h3>
            <Button variant="ghost" size="icon" onClick={toggleChat}>
              <X className="size-4" />
            </Button>
          </CardHeader>
          <CardContent className="grow overflow-auto">
            {messages.map((msg, index) => (
              <div key={index} className="mb-2 rounded-lg bg-secondary p-2">
                {msg}
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <form onSubmit={sendMessage} className="flex w-full gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type a message..."
              />
              <Button type="submit" size="icon">
                <Send className="size-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
      <Button onClick={toggleChat} size="icon" className="size-12 rounded-full">
        <MessageCircle className="size-6" />
      </Button>
    </div>
  );
}
