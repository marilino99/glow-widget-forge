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
  ChevronDown,
  CheckSquare,
  Hand,
  Inbox,
  Trash2,
  Users,
} from "lucide-react";
import { format, formatDistanceToNow, differenceInMinutes, differenceInHours, differenceInDays } from "date-fns";

const shortTimeAgo = (date: Date) => {
  const now = new Date();
  const mins = differenceInMinutes(now, date);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins} min`;
  const hrs = differenceInHours(now, date);
  if (hrs < 24) return `${hrs} h`;
  const days = differenceInDays(now, date);
  if (days < 30) return `${days} d`;
  return `${Math.floor(days / 30)} mo`;
};

interface Conversation {
  id: string;
  visitor_id: string;
  visitor_name: string;
  last_message: string | null;
  last_message_at: string;
  unread_count: number;
  created_at: string;
  updated_at: string;
  topic: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  browser: string | null;
  system: string | null;
}

interface ProductMeta {
  title: string;
  imageUrl?: string | null;
  productUrl?: string | null;
  price?: string | null;
  shopifyVariantId?: string | null;
}

interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_type: "visitor" | "owner";
  content: string;
  created_at: string;
  metadata?: { products?: ProductMeta[] } | null;
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
  const [customerInfoOpen, setCustomerInfoOpen] = useState(false);
  const [aiOverviewOpen, setAiOverviewOpen] = useState(false);
  const [aiOverviewData, setAiOverviewData] = useState<{ summary: string[]; tags: string[] } | null>(null);
  const [aiOverviewLoading, setAiOverviewLoading] = useState(false);
  const [mobileView, setMobileView] = useState<"filters" | "list" | "chat">("list");
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
          // On first load, auto-select the latest unread conversation
          if (prev.length === 0 && !selectedConversation) {
            const latestUnread = data.find((c) => c.unread_count > 0);
            if (latestUnread) {
              setSelectedConversation(latestUnread);
            }
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

  const AVATAR_COLORS = [
    "from-emerald-400 to-emerald-600",
    "from-amber-400 to-yellow-500",
    "from-blue-400 to-blue-600",
    "from-rose-400 to-pink-600",
    "from-violet-400 to-purple-600",
    "from-cyan-400 to-teal-600",
    "from-orange-400 to-orange-600",
    "from-lime-400 to-green-600",
    "from-fuchsia-400 to-fuchsia-600",
    "from-sky-400 to-indigo-500",
  ];

  const getVisitorIdentity = (visitorId: string, index: number) => {
    const letters = "ABCDEFGHJKLMNPRSTUVWXYZ";
    const digits = "0123456789";
    const chars = letters + digits;
    const hash1 = visitorId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const hash2 = visitorId.split("").reduce((acc, c, i) => acc + c.charCodeAt(0) * (i + 1), 0);
    const letter = chars[hash1 % chars.length];
    const color = AVATAR_COLORS[(hash1 + hash2) % AVATAR_COLORS.length];
    return { letter, color };
  };

  const isOnline = (lastMessageAt: string) => {
    const diff = Date.now() - new Date(lastMessageAt).getTime();
    return diff < 5 * 60 * 1000; // 5 minutes
  };

  const StatusDot = ({ online, size = "md" }: { online: boolean; size?: "sm" | "md" }) => (
    <span
      className={`absolute bottom-0 right-0 rounded-full border-2 border-background ${
        online ? "bg-green-500" : "bg-gray-300"
      } ${size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"}`}
    />
  );

  // When a conversation is selected on mobile, jump to chat view
  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
    setAiOverviewData(null);
    setAiOverviewOpen(false);
    setMobileView("chat");
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
      {/* Column 1: Filter sidebar - hidden on mobile, shown via mobileView */}
      <div className={`${mobileView === "filters" ? "flex" : "hidden"} lg:flex w-full lg:w-52 shrink-0 flex-col border-r border-border bg-background`}>
        <div className="px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">Conversations</h2>
        </div>
        <div className="flex-1 px-2 space-y-0.5">
          {FILTER_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => { setActiveFilter(item.key); setMobileView("list"); }}
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
      <div className={`${mobileView === "list" ? "flex" : "hidden"} lg:flex w-full lg:w-72 shrink-0 flex-col border-r border-border bg-background overflow-hidden`}>
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <button onClick={() => setMobileView("filters")} className="lg:hidden rounded-md p-1 text-muted-foreground hover:bg-muted/50 transition-colors mr-1">
              <SlidersHorizontal className="h-4 w-4" />
            </button>
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
            <div className="space-y-0.5 p-1.5 overflow-hidden">
              {filteredConversations.map((conv, idx) => {
                const identity = getVisitorIdentity(conv.visitor_id, idx);
                const title = conv.topic || conv.last_message?.split(/\s+/).slice(0, 4).join(" ") || "New Conversation";
                return (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors overflow-hidden ${
                    selectedConversation?.id === conv.id
                      ? "bg-blue-50"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${identity.color}`}>
                      <span className="text-xs font-semibold text-white">
                        {identity.letter}
                      </span>
                    </div>
                    <StatusDot online={isOnline(conv.last_message_at)} />
                  </div>
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <span className={`block text-sm truncate ${conv.unread_count > 0 ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>
                      {title}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <MessageCircle className="h-3 w-3 text-muted-foreground shrink-0" />
                      <p className={`truncate text-xs min-w-0 flex-1 ${conv.unread_count > 0 ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                        {(() => { const msg = conv.last_message || "New conversation"; return msg.length > 25 ? msg.slice(0, 25) + "…" : msg; })()}
                      </p>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                        {shortTimeAgo(new Date(conv.last_message_at))}
                      </span>
                    </div>
                  </div>
                  {conv.unread_count > 0 && (
                    <span className="mt-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                      {conv.unread_count}
                    </span>
                  )}
                </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Column 3: Chat area */}
      <div className={`${mobileView === "chat" ? "flex" : "hidden"} lg:flex flex-1 flex-col bg-background`}>
        {selectedConversation ? (
          <>
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div className="flex items-center gap-2">
                <button onClick={() => setMobileView("list")} className="lg:hidden rounded-md p-1 text-muted-foreground hover:bg-muted/50 transition-colors">
                  <ChevronRight className="h-4 w-4 rotate-180" />
                </button>
                <h3 className="text-sm font-semibold text-foreground">
                  {selectedConversation.topic || selectedConversation.last_message?.split(/\s+/).slice(0, 4).join(" ") || "New Conversation"}
                </h3>
              </div>
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
                        {message.sender_type === "visitor" && (() => {
                          const selIdentity = getVisitorIdentity(selectedConversation.visitor_id, 0);
                          const online = isOnline(selectedConversation.last_message_at);
                          return (
                            <div className="relative shrink-0">
                              <div className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${selIdentity.color}`}>
                                <span className="text-[10px] font-semibold text-white">
                                  {selIdentity.letter}
                                </span>
                              </div>
                              <StatusDot online={online} size="sm" />
                            </div>
                          );
                        })()}
                        <div className="max-w-[70%]">
                          <div
                            className={`rounded-2xl px-4 py-2.5 ${
                              message.sender_type === "owner"
                                ? "bg-blue-500 text-white rounded-br-md"
                                : "bg-muted rounded-bl-md"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </div>
                          {/* Product cards */}
                          {message.metadata && (message.metadata as any).products && (message.metadata as any).products.length > 0 && (
                            <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                              {((message.metadata as any).products as ProductMeta[]).map((product, pIdx) => (
                                <div
                                  key={pIdx}
                                  className="flex-shrink-0 w-36 rounded-xl border border-border bg-background overflow-hidden shadow-sm"
                                >
                                  {product.imageUrl && (
                                    <img
                                      src={product.imageUrl}
                                      alt={product.title}
                                      className="w-full h-20 object-cover"
                                    />
                                  )}
                                  <div className="p-2">
                                    {product.price && (
                                      <p className="text-xs font-semibold text-foreground">{product.price}</p>
                                    )}
                                    <p className="text-[11px] text-muted-foreground truncate">{product.title}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
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
      <div className="hidden md:flex w-72 shrink-0 flex-col border-l border-border bg-background overflow-hidden">
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

        <div className="flex-1 overflow-y-auto">
          {detailsTab === "details" ? (
            <div className="px-5 py-4">
              {selectedConversation ? (
                <div className="space-y-4">
                  {/* Key details table */}
                  <div className="space-y-3.5">
                    <div className="flex items-start min-w-0">
                      <span className="w-24 shrink-0 text-sm text-muted-foreground">Status</span>
                      <span className="text-sm font-medium text-foreground">
                        {isOnline(selectedConversation.last_message_at) ? "Active" : "Closed by user"}
                      </span>
                    </div>
                    <div className="flex items-start min-w-0">
                      <span className="w-24 shrink-0 text-sm text-muted-foreground">Sentiment</span>
                      <button
                        onClick={() => onUpgrade?.()}
                        className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        Not analyzed
                        <span className="rounded bg-foreground px-1.5 py-0.5 text-[10px] font-semibold leading-none text-background">PLUS</span>
                      </button>
                    </div>
                    <div className="flex items-start min-w-0">
                      <span className="w-24 shrink-0 text-sm text-muted-foreground">Assignee</span>
                      <span className="text-sm font-medium text-foreground">WidjetAI</span>
                    </div>
                    <div className="flex items-start min-w-0">
                      <span className="w-24 shrink-0 text-sm text-muted-foreground">ID</span>
                      <span
                        className="text-sm font-mono text-foreground truncate min-w-0 cursor-pointer hover:text-foreground/70 transition-colors"
                        title="Double-click to copy"
                        onDoubleClick={() => navigator.clipboard.writeText(selectedConversation.id)}
                      >
                        {selectedConversation.id}
                      </span>
                    </div>
                    <div className="flex items-start min-w-0">
                      <span className="w-24 shrink-0 text-sm text-muted-foreground">Channel</span>
                      <div className="flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5 text-foreground" />
                        <span className="text-sm font-medium text-foreground">Web Chat</span>
                      </div>
                    </div>
                  </div>

                  <div className="-mx-5" style={{ background: 'linear-gradient(90deg, rgba(219, 206, 252, 0.25) 0%, rgba(192, 132, 252, 0.22) 100%)' }}>
                    <div className="border-t border-border" />
                    <button
                      onClick={async () => {
                        const opening = !aiOverviewOpen;
                        setAiOverviewOpen(opening);
                        if (opening && !aiOverviewData && selectedConversation) {
                          setAiOverviewLoading(true);
                          try {
                            const { data: { session } } = await supabase.auth.getSession();
                            const res = await fetch(
                              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-overview`,
                              {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${session?.access_token}`,
                                  apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
                                },
                                body: JSON.stringify({ conversation_id: selectedConversation.id }),
                              }
                            );
                            const data = await res.json();
                            if (data.summary) setAiOverviewData(data);
                          } catch (e) {
                            console.error("AI overview error:", e);
                          } finally {
                            setAiOverviewLoading(false);
                          }
                        }
                      }}
                      className="flex w-full items-center justify-between px-5 py-2.5 text-sm font-medium text-foreground hover:text-foreground/80 transition-all"
                    >
                      <span>AI overview</span>
                      {aiOverviewOpen ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                    {aiOverviewOpen && (
                      <div className="px-5 pb-4 pt-1">
                        {aiOverviewLoading ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Analyzing conversation…</span>
                          </div>
                        ) : aiOverviewData ? (
                          <div className="space-y-3">
                            <p className="text-sm font-semibold text-foreground">Summary</p>
                            {aiOverviewData.summary.map((p, i) => (
                              <p key={i} className="text-sm text-foreground/80 leading-relaxed">{p}</p>
                            ))}
                            {aiOverviewData.tags.length > 0 && (
                              <div className="pt-1">
                                <p className="text-sm font-semibold text-foreground mb-2">Suggested tags</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {aiOverviewData.tags.map((tag, i) => (
                                    <span key={i} className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Could not load AI overview.</p>
                        )}
                      </div>
                    )}
                    <div className="border-t border-border" />
                  </div>
                  <button
                    onClick={() => setCustomerInfoOpen(!customerInfoOpen)}
                    className="flex w-full items-center justify-between py-1 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
                  >
                    <span>Customer info</span>
                    {customerInfoOpen ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  {customerInfoOpen && (
                    <div className="space-y-3 pb-2">
                      <div className="flex items-start">
                        <span className="w-28 shrink-0 text-sm text-muted-foreground">External ID</span>
                        <span
                          className="text-sm font-mono text-foreground truncate cursor-pointer hover:text-foreground/70 transition-colors"
                          title="Double-click to copy"
                          onDoubleClick={() => navigator.clipboard.writeText(selectedConversation.visitor_id)}
                        >
                          {selectedConversation.visitor_id.replace('v_', '')}
                        </span>
                      </div>
                      {selectedConversation.region && (
                        <div className="flex items-start">
                          <span className="w-28 shrink-0 text-sm text-muted-foreground">Region</span>
                          <span className="text-sm text-foreground">{selectedConversation.region}</span>
                        </div>
                      )}
                      {selectedConversation.country && (
                        <div className="flex items-start">
                          <span className="w-28 shrink-0 text-sm text-muted-foreground">Country</span>
                          <span className="text-sm text-foreground">{selectedConversation.country}</span>
                        </div>
                      )}
                      {selectedConversation.city && (
                        <div className="flex items-start">
                          <span className="w-28 shrink-0 text-sm text-muted-foreground">City</span>
                          <span className="text-sm text-foreground">{selectedConversation.city}</span>
                        </div>
                      )}
                      {selectedConversation.browser && (
                        <div className="flex items-start">
                          <span className="w-28 shrink-0 text-sm text-muted-foreground">Browser</span>
                          <span className="text-sm text-foreground">{selectedConversation.browser}</span>
                        </div>
                      )}
                      {selectedConversation.system && (
                        <div className="flex items-start">
                          <span className="w-28 shrink-0 text-sm text-muted-foreground">System</span>
                          <span className="text-sm text-foreground">{selectedConversation.system}</span>
                        </div>
                      )}
                      <div className="flex items-start">
                        <span className="w-28 shrink-0 text-sm text-muted-foreground">Created at</span>
                        <span className="text-sm text-foreground">
                          {format(new Date(selectedConversation.created_at), "MMM d, yyyy, hh:mm a")}
                        </span>
                      </div>
                      <div className="flex items-start">
                        <span className="w-28 shrink-0 text-sm text-muted-foreground">Last activity</span>
                        <span className="text-sm text-foreground">
                          {formatDistanceToNow(new Date(selectedConversation.last_message_at || selectedConversation.updated_at), { addSuffix: true }).replace('about ', '').replace('less than a minute ago', 'Just now').replace('less than ', '')}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="-mx-5 border-t border-border" />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center">Select a conversation</p>
              )}
            </div>
          ) : (
            <div className="px-5 py-4">
              {selectedConversation ? (
                <div className="space-y-3.5">
                  <div className="flex items-start">
                    <span className="w-28 shrink-0 text-sm text-muted-foreground">Current page</span>
                    <span className="text-sm text-foreground">-</span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-28 shrink-0 text-sm text-muted-foreground">Session</span>
                    <span className="text-sm text-foreground">{selectedConversation.id.slice(0, 8)}…</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center">Select a conversation</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationsPanel;
