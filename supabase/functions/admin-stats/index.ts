import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ADMIN_USER_ID = "43c72ef7-a716-4d7f-af75-1a64aba01c24";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user || user.id !== ADMIN_USER_ID) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse days parameter
    const url = new URL(req.url);
    const daysParam = url.searchParams.get("days") || "all";
    const days = daysParam === "all" ? null : parseInt(daysParam, 10);
    const sinceDate = days ? new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString() : null;

    // Fetch all data in parallel
    const [
      usersCountRes,
      widgetsCountRes,
      conversationsCountRes,
      messagesCountRes,
      allWidgets,
      allConversations,
      allMessages,
      allContacts,
      activeWidgetsRes,
      profilesRes,
      activityLogsRes,
    ] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("widget_configurations").select("id", { count: "exact", head: true }),
      sinceDate
        ? supabase.from("conversations").select("id", { count: "exact", head: true }).gte("created_at", sinceDate)
        : supabase.from("conversations").select("id", { count: "exact", head: true }),
      sinceDate
        ? supabase.from("chat_messages").select("id", { count: "exact", head: true }).gte("created_at", sinceDate)
        : supabase.from("chat_messages").select("id", { count: "exact", head: true }),
      supabase.from("widget_configurations").select("id, user_id, contact_name, website_url, chatbot_enabled, chatbot_instructions, voice_instructions, language"),
      supabase.from("conversations").select("id, widget_owner_id, created_at, last_message_at").order("last_message_at", { ascending: false }).limit(5000),
      sinceDate
        ? supabase.from("chat_messages").select("conversation_id, is_ai_response, sender_type, created_at").gte("created_at", sinceDate).limit(10000)
        : supabase.from("chat_messages").select("conversation_id, is_ai_response, sender_type, created_at").limit(10000),
      supabase.from("contacts").select("id, user_id, created_at").limit(5000),
      supabase.from("widget_events").select("widget_id").limit(2000),
      supabase.from("profiles").select("user_id, created_at").order("created_at", { ascending: false }),
      sinceDate
        ? supabase.from("user_activity_logs").select("user_id, created_at").gte("created_at", sinceDate).limit(10000)
        : supabase.from("user_activity_logs").select("user_id, created_at").limit(10000),
    ]);

    // Paginate auth users to get ALL users (not capped at 1000)
    let authUsers: any[] = [];
    let page = 1;
    while (true) {
      const { data: batch } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
      const users = batch?.users || [];
      authUsers = authUsers.concat(users);
      if (users.length < 1000) break;
      page++;
    }
    const widgets = allWidgets.data || [];
    const conversations = allConversations.data || [];
    const messages = allMessages.data || [];
    const contacts = allContacts.data || [];
    const profiles = profilesRes.data || [];
    const activityLogs = activityLogsRes.data || [];

    // Active users from activity logs in period
    const activeUsersInPeriod = new Set(activityLogs.map((l: any) => l.user_id)).size;

    // Users with conversations in period
    const filteredConvsForCount = sinceDate
      ? conversations.filter((c: any) => c.created_at && c.created_at >= sinceDate)
      : conversations;
    const usersWithConversationsInPeriod = new Set(filteredConvsForCount.map((c: any) => c.widget_owner_id)).size;

    // Build conversation owner map
    const convOwnerMap: Record<string, string> = {};
    const convLastMessageMap: Record<string, string> = {};
    conversations.forEach((c) => {
      convOwnerMap[c.id] = c.widget_owner_id;
      if (!convLastMessageMap[c.widget_owner_id] || (c.last_message_at && c.last_message_at > convLastMessageMap[c.widget_owner_id])) {
        convLastMessageMap[c.widget_owner_id] = c.last_message_at || c.created_at || "";
      }
    });

    // Count contacts per user
    const contactsPerUser: Record<string, number> = {};
    contacts.forEach((c) => {
      contactsPerUser[c.user_id] = (contactsPerUser[c.user_id] || 0) + 1;
    });

    // Build per-user stats
    const userStatsMap: Record<string, {
      email: string;
      contactName: string;
      websiteUrl: string | null;
      aiResponses: number;
      visitorMessages: number;
      conversations: number;
      contacts: number;
      chatbotEnabled: boolean;
      signupDate: string | null;
      lastActive: string | null;
    }> = {};

    // Initialize all auth users (so we see inactive ones too)
    authUsers.forEach((au) => {
      const widget = widgets.find((w) => w.user_id === au.id);
      const profile = profiles.find((p) => p.user_id === au.id);
      userStatsMap[au.id] = {
        email: au.email || "unknown",
        contactName: widget?.contact_name || "—",
        websiteUrl: widget?.website_url || null,
        aiResponses: 0,
        visitorMessages: 0,
        conversations: 0,
        contacts: contactsPerUser[au.id] || 0,
        chatbotEnabled: widget?.chatbot_enabled ?? false,
        signupDate: profile?.created_at || au.created_at || null,
        lastActive: convLastMessageMap[au.id] || null,
      };
    });

    // Count messages per owner
    messages.forEach((m) => {
      const ownerId = convOwnerMap[m.conversation_id];
      if (!ownerId || !userStatsMap[ownerId]) return;
      if (m.is_ai_response) userStatsMap[ownerId].aiResponses++;
      if (m.sender_type === "visitor") userStatsMap[ownerId].visitorMessages++;
    });

    // Count conversations per owner (filtered by time if needed)
    const filteredConversations = sinceDate
      ? conversations.filter((c) => c.created_at && c.created_at >= sinceDate)
      : conversations;
    filteredConversations.forEach((c) => {
      if (userStatsMap[c.widget_owner_id]) {
        userStatsMap[c.widget_owner_id].conversations++;
      }
    });

    const allUsersList = Object.entries(userStatsMap)
      .map(([userId, stats]) => ({ userId, ...stats }))
      .sort((a, b) => b.aiResponses - a.aiResponses);

    // Active widgets
    const activeWidgetIds = new Set(activeWidgetsRes.data?.map((e) => e.widget_id) || []);

    // Build active widget users list
    const activeWidgetUsers = widgets
      .filter((w) => activeWidgetIds.has(w.id))
      .map((w) => {
        const au = authUsers.find((u) => u.id === w.user_id);
        return {
          email: au?.email || "unknown",
          contactName: w.contact_name || "—",
          websiteUrl: w.website_url || null,
          widgetId: w.id,
        };
      });

    // Signups by day (dynamic based on days filter)
    const signupsByDay: Record<string, number> = {};
    const signupCutoff = sinceDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    profiles.forEach((p) => {
      if (p.created_at >= signupCutoff) {
        const day = p.created_at.split("T")[0];
        signupsByDay[day] = (signupsByDay[day] || 0) + 1;
      }
    });

    // New users in period
    const newUsersInPeriod = sinceDate
      ? profiles.filter((p) => p.created_at >= sinceDate).length
      : profiles.length;

    // Activation rate
    const usersWithConversations = new Set(conversations.map((c) => c.widget_owner_id)).size;
    const activationRate = authUsers.length > 0
      ? Math.round((usersWithConversations / authUsers.length) * 100)
      : 0;

    // Total contacts in period
    const totalContactsInPeriod = sinceDate
      ? contacts.filter((c) => c.created_at && c.created_at >= sinceDate).length
      : contacts.length;

    // Avg messages per user
    const totalMsgsInPeriod = messages.length;
    const activeUsersWithMsgs = new Set(
      messages.map((m) => convOwnerMap[m.conversation_id]).filter(Boolean)
    ).size;
    const avgMessagesPerUser = activeUsersWithMsgs > 0
      ? Math.round(totalMsgsInPeriod / activeUsersWithMsgs)
      : 0;

    // Widget instructions overview
    const widgetInstructions = widgets.map((w: any) => {
      const au = authUsers.find((u: any) => u.id === w.user_id);
      return {
        widgetId: w.id,
        email: au?.email || "unknown",
        contactName: w.contact_name || "—",
        websiteUrl: w.website_url || null,
        language: w.language || "en",
        chatInstructions: w.chatbot_instructions || null,
        voiceInstructions: w.voice_instructions || null,
      };
    }).filter((w: any) => w.chatInstructions || w.voiceInstructions);

    const stats = {
      totalUsers: usersCountRes.count ?? 0,
      totalAuthUsers: authUsers.length,
      totalWidgets: widgetsCountRes.count ?? 0,
      totalConversations: conversationsCountRes.count ?? 0,
      totalMessages: messagesCountRes.count ?? 0,
      activeWidgets: activeWidgetIds.size,
      recentSignups: signupsByDay,
      topUsers: allUsersList,
      newUsersInPeriod,
      activationRate,
      totalContacts: totalContactsInPeriod,
      avgMessagesPerUser,
      activeUsersInPeriod,
      usersWithConversationsInPeriod,
      activeWidgetUsers,
      widgetInstructions,
    };

    return new Response(JSON.stringify(stats), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
