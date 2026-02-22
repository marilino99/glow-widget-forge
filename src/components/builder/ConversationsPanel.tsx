import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  MessageCircle,
  User,
  Search,
  Globe,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { enUS } from "date-fns/locale";

interface Conversation {
  id: string;
  visitor_id: string;
  visitor_name: string;
  last_message: string | null;
  last_message_at: string;
  unread_count: number;
  created_at: string;
}

interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_type: "visitor" | "owner";
  content: string;
  created_at: string;
}

const ConversationsPanel = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("widget_owner_id", user.id)
        .order("last_message_at", { ascending: false });

      if (!error && data) {
        setConversations(data);
      }
      setLoading(false);
    };

    fetchConversations();

    const channel = supabase
      .channel("conversations-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
          filter: `widget_owner_id=eq.${user.id}`,
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", selectedConversation.id)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setMessages(data as ChatMessage[]);
      }
    };

    fetchMessages();

    supabase
      .from("conversations")
      .update({ unread_count: 0 })
      .eq("id", selectedConversation.id)
      .then();

    const channel = supabase
      .channel(`messages-${selectedConversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `conversation_id=eq.${selectedConversation.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const messageContent = newMessage.trim();
    setNewMessage("");

    await supabase.functions.invoke("send-owner-message", {
      body: {
        conversationId: selectedConversation.id,
        message: messageContent,
      },
    });
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.visitor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.last_message?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalConversations = conversations.length;

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-hidden bg-[#fafafa]">
      {/* Conversation list */}
      <div className="flex w-80 shrink-0 flex-col border-r border-border bg-background">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" style={{ color: "#5b5b65" }} />
            <span className="text-sm font-semibold" style={{ color: "#1c1c1d" }}>
              All conversations
            </span>
          </div>
          <span
            className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium"
            style={{ color: "#5b5b65" }}
          >
            {totalConversations}
          </span>
        </div>

        {/* Search */}
        <div className="px-3 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-9 text-sm rounded-lg"
            />
          </div>
        </div>

        {/* Conversations */}
        <ScrollArea className="flex-1">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <MessageCircle className="h-10 w-10 text-muted-foreground/30" />
              <p className="mt-3 text-sm text-muted-foreground">No conversations</p>
              <p className="text-xs text-muted-foreground">Messages will appear here</p>
            </div>
          ) : (
            <div className="space-y-0.5 p-1.5">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    setSelectedConversation(conv);
                    setShowDetails(false);
                  }}
                  className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                    selectedConversation?.id === conv.id
                      ? "bg-[#f0f0f0]"
                      : "hover:bg-[#f8f8f8]"
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600">
                    <span className="text-xs font-semibold text-white">
                      {(conv.visitor_name || "V").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium" style={{ color: "#1c1c1d" }}>
                        {conv.visitor_name || "Visitor"}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {formatDistanceToNow(new Date(conv.last_message_at), {
                          addSuffix: false,
                          locale: enUS,
                        })}
                      </span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground mt-0.5">
                      {conv.last_message || "New conversation"}
                    </p>
                  </div>
                  {conv.unread_count > 0 && (
                    <span className="mt-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                      {conv.unread_count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat area */}
      <div className="flex flex-1 flex-col bg-background">
        {selectedConversation ? (
          <>
            {/* Chat header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600">
                  <span className="text-xs font-semibold text-white">
                    {(selectedConversation.visitor_name || "V").charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: "#1c1c1d" }}>
                    {selectedConversation.visitor_name || "Visitor"}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Started{" "}
                    {format(new Date(selectedConversation.created_at), "MMM d, h:mm a")}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="text-muted-foreground hover:text-foreground"
              >
                Details
                <ChevronRight className={`ml-1 h-4 w-4 transition-transform ${showDetails ? "rotate-180" : ""}`} />
              </Button>
            </div>

            {/* Messages + Details split */}
            <div className="flex flex-1 overflow-hidden">
              {/* Messages */}
              <div className="flex flex-1 flex-col">
                <ScrollArea className="flex-1 px-5 py-4">
                  <div className="space-y-3">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_type === "owner" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                            message.sender_type === "owner"
                              ? "rounded-tr-md bg-primary text-primary-foreground"
                              : "rounded-tl-md bg-muted"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p
                            className={`mt-1 text-[10px] ${
                              message.sender_type === "owner"
                                ? "text-primary-foreground/60"
                                : "text-muted-foreground"
                            }`}
                          >
                            {format(new Date(message.created_at), "h:mm a")}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="border-t border-border px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="flex-1 rounded-xl"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      size="icon"
                      className="shrink-0 rounded-xl"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Details panel */}
              {showDetails && (
                <div className="w-72 shrink-0 border-l border-border bg-[#fafafa] overflow-y-auto">
                  <div className="p-5 space-y-6">
                    <h4 className="text-sm font-semibold" style={{ color: "#1c1c1d" }}>
                      Details
                    </h4>

                    {/* Visitor info */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600">
                          <span className="text-sm font-semibold text-white">
                            {(selectedConversation.visitor_name || "V").charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: "#1c1c1d" }}>
                            {selectedConversation.visitor_name || "Visitor"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {selectedConversation.visitor_id.slice(0, 12)}...
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "#5b5b65" }}>
                        Status
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-sm text-foreground">Active</span>
                      </div>
                    </div>

                    {/* Channel */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "#5b5b65" }}>
                        Channel
                      </p>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" style={{ color: "#5b5b65" }} />
                        <span className="text-sm text-foreground">Web Chat</span>
                      </div>
                    </div>

                    {/* Conversation ID */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "#5b5b65" }}>
                        ID
                      </p>
                      <p className="text-xs text-muted-foreground font-mono break-all">
                        {selectedConversation.id}
                      </p>
                    </div>

                    {/* Created */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "#5b5b65" }}>
                        Created
                      </p>
                      <p className="text-sm text-foreground">
                        {format(new Date(selectedConversation.created_at), "MMM d, yyyy h:mm a")}
                      </p>
                    </div>

                    {/* Messages count */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "#5b5b65" }}>
                        Messages
                      </p>
                      <p className="text-sm text-foreground">{messages.length}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <MessageCircle className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h2 className="mt-4 text-lg font-semibold" style={{ color: "#1c1c1d" }}>
              Select a conversation
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose from the list to view messages
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationsPanel;
