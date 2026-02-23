import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  MessageCircle,
  Search,
  Globe,
  Loader2,
  MoreVertical,
  SlidersHorizontal,
  ChevronRight,
  CheckSquare,
  Hand,
  Inbox,
  Trash2,
  Users,
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

type FilterType = "all" | "assign_to_me" | "unassigned" | "resolved" | "deleted";

const FILTER_ITEMS: { key: FilterType; label: string; icon: React.ReactNode; color: string }[] = [
  { key: "all", label: "All conversations", icon: <Users className="h-4 w-4" />, color: "text-blue-600" },
  { key: "assign_to_me", label: "Assign to me", icon: <Inbox className="h-4 w-4" />, color: "text-blue-500" },
  { key: "unassigned", label: "Unassigned", icon: <Hand className="h-4 w-4" />, color: "text-yellow-500" },
  { key: "resolved", label: "Resolved", icon: <CheckSquare className="h-4 w-4" />, color: "text-green-500" },
];

interface ConversationsPanelProps {
  isAtLimit?: boolean;
  isPro?: boolean;
  onUpgrade?: () => void;
}

const ConversationsPanel = ({ isAtLimit = false, isPro = false, onUpgrade }: ConversationsPanelProps) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [detailsTab, setDetailsTab] = useState<"details" | "activity">("details");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const fetchConversations = async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("widget_owner_id", user.id)
        .order("last_message_at", { ascending: false });
      if (!error && data) {
        setConversations((prev) => {
          // Detect new conversations not in the previous list
          const prevIds = new Set(prev.map((c) => c.id));
          const newConv = data.find((c) => !prevIds.has(c.id));
          if (newConv && prev.length > 0) {
            setSelectedConversation(newConv);
          }
          return data;
        });
      }
      setLoading(false);
    };
    fetchConversations();
    const channel = supabase
      .channel("conversations-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations", filter: `widget_owner_id=eq.${user.id}` }, () => fetchConversations())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  useEffect(() => {
    if (!selectedConversation) return;
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", selectedConversation.id)
        .order("created_at", { ascending: true });
      if (!error && data) setMessages(data as ChatMessage[]);
    };
    fetchMessages();
    supabase.from("conversations").update({ unread_count: 0 }).eq("id", selectedConversation.id).then();
    const channel = supabase
      .channel(`messages-${selectedConversation.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `conversation_id=eq.${selectedConversation.id}` }, (payload) => {
        setMessages((prev) => [...prev, payload.new as ChatMessage]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    const messageContent = newMessage.trim();
    setNewMessage("");
    await supabase.functions.invoke("send-owner-message", {
      body: { conversationId: selectedConversation.id, message: messageContent },
    });
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.visitor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.last_message?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filterCounts: Record<FilterType, number> = {
    all: conversations.length,
    assign_to_me: 0,
    unassigned: 0,
    resolved: 0,
    deleted: 0,
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const getAvatarColor = (name: string) => {
    const colors = [
      "from-purple-500 to-violet-600",
      "from-blue-500 to-cyan-600",
      "from-green-500 to-emerald-600",
      "from-orange-500 to-red-600",
      "from-pink-500 to-rose-600",
    ];
    const idx = (name || "V").charCodeAt(0) % colors.length;
    return colors[idx];
  };

  return (
    <div className="relative flex flex-1 overflow-hidden bg-background">
      {/* AI Limit Banner */}
      {isAtLimit && !isPro && (
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between bg-red-50 border-b border-red-200 px-5 py-2.5">
          <p className="text-sm text-red-700">
            AI responses are exhausted for this month. Upgrade to continue automatic replies.
          </p>
          {onUpgrade && (
            <button
              onClick={onUpgrade}
              className="shrink-0 rounded-lg bg-purple-600 px-3 py-1 text-xs font-medium text-white hover:bg-purple-700 transition-colors"
            >
              Upgrade
            </button>
          )}
        </div>
      )}
      {/* Column 1: Filter sidebar */}
      <div className="flex w-52 shrink-0 flex-col border-r border-border bg-background">
        <div className="px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">Conversations</h2>
        </div>
        <div className="flex-1 px-2 space-y-0.5">
          {FILTER_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveFilter(item.key)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                activeFilter === item.key
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <span className={activeFilter === item.key ? "text-blue-600" : item.color}>{item.icon}</span>
              <span className="flex-1 text-left">{item.label}</span>
              <span className="text-xs text-muted-foreground">{filterCounts[item.key]}</span>
            </button>
          ))}
        </div>
        <div className="px-2 pb-4">
          <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50 transition-colors">
            <Trash2 className="h-4 w-4 text-muted-foreground" />
            <span>Deleted</span>
          </button>
        </div>
      </div>

      {/* Column 2: Conversation list */}
      <div className="flex w-72 shrink-0 flex-col border-r border-border bg-background">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">All conversations</span>
          </div>
          <button className="rounded-md p-1 text-muted-foreground hover:bg-muted/50 transition-colors">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-9 text-sm rounded-lg border-border"
            />
          </div>
          <button className="rounded-md border border-border p-1.5 text-muted-foreground hover:bg-muted/50 transition-colors">
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>
        <ScrollArea className="flex-1">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <MessageCircle className="h-10 w-10 text-muted-foreground/30" />
              <p className="mt-3 text-sm text-muted-foreground">No conversations</p>
            </div>
          ) : (
            <div className="space-y-0.5 p-1.5">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                    selectedConversation?.id === conv.id
                      ? "bg-blue-50"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getAvatarColor(conv.visitor_name || "V")}`}>
                    <span className="text-xs font-semibold text-white">
                      {(conv.visitor_name || "V").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground truncate">
                        {conv.visitor_name || "Visitor"}
                      </span>
                      <span className="text-[11px] text-muted-foreground shrink-0 ml-2">
                        {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: false, locale: enUS })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <MessageCircle className="h-3 w-3 text-muted-foreground shrink-0" />
                      <p className="truncate text-xs text-muted-foreground">
                        {conv.last_message || "New conversation"}
                      </p>
                    </div>
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

      {/* Column 3: Chat area */}
      <div className="flex flex-1 flex-col bg-background">
        {selectedConversation ? (
          <>
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <h3 className="text-sm font-semibold text-foreground">
                {selectedConversation.visitor_name || "Visitor"}
              </h3>
              <button className="rounded-md p-1 text-muted-foreground hover:bg-muted/50 transition-colors">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
            <ScrollArea className="flex-1 px-5 py-4">
              <div className="space-y-4">
                {messages.map((message, idx) => {
                  const showDate = idx === 0 || format(new Date(message.created_at), "yyyy-MM-dd") !== format(new Date(messages[idx - 1].created_at), "yyyy-MM-dd");
                  return (
                    <div key={message.id}>
                      {showDate && (
                        <div className="flex justify-center my-3">
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(message.created_at), "MMM d, h:mm a")}
                          </span>
                        </div>
                      )}
                      <div className={`flex items-end gap-2 ${message.sender_type === "owner" ? "justify-end" : "justify-start"}`}>
                        {message.sender_type === "visitor" && (
                          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getAvatarColor(selectedConversation.visitor_name || "V")}`}>
                            <span className="text-[10px] font-semibold text-white">
                              {(selectedConversation.visitor_name || "V").charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                            message.sender_type === "owner"
                              ? "bg-blue-500 text-white rounded-br-md"
                              : "bg-muted rounded-bl-md"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                        {message.sender_type === "owner" && (
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500">
                            <MessageCircle className="h-3.5 w-3.5 text-white" />
                          </div>
                        )}
                      </div>
                      <p className={`text-[10px] text-muted-foreground mt-1 ${message.sender_type === "owner" ? "text-right mr-9" : "ml-9"}`}>
                        {format(new Date(message.created_at), "h:mm a")}
                      </p>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
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
                  className="flex-1 rounded-xl border-border"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  size="icon"
                  className="shrink-0 rounded-xl bg-blue-500 hover:bg-blue-600"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <MessageCircle className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-foreground">Select a conversation</h2>
            <p className="mt-1 text-sm text-muted-foreground">Choose from the list to view messages</p>
          </div>
        )}
      </div>

      {/* Column 4: Details panel - always visible */}
      <div className="flex w-72 shrink-0 flex-col border-l border-border bg-background">
        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setDetailsTab("details")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              detailsTab === "details"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setDetailsTab("activity")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              detailsTab === "activity"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Customer Activity
          </button>
        </div>

        <ScrollArea className="flex-1">
          {detailsTab === "details" ? (
            <div className="p-5 space-y-5">
              {selectedConversation ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <span className="text-sm text-foreground">Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Assignee</span>
                    <span className="text-sm text-foreground">—</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">ID</span>
                    <span className="text-xs text-muted-foreground font-mono truncate max-w-[140px]">
                      {selectedConversation.id.slice(0, 18)}...
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Channel</span>
                    <div className="flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm text-foreground">Web Chat</span>
                    </div>
                  </div>
                  <div className="border-t border-border" />
                  <button className="flex w-full items-center justify-between py-1 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors">
                    <span>AI overview</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <div className="border-t border-border" />
                  <button className="flex w-full items-center justify-between py-1 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors">
                    <span>Customer info</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <div className="border-t border-border" />
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Created</span>
                      <span className="text-xs text-foreground">
                        {format(new Date(selectedConversation.created_at), "MMM d, yyyy")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Messages</span>
                      <span className="text-xs text-foreground">{messages.length}</span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center">Select a conversation</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <p className="text-sm text-muted-foreground">No activity recorded</p>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default ConversationsPanel;
