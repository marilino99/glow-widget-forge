import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Admin user ID - only this user can access stats
const ADMIN_USER_ID = "43c72ef7-a716-4d7f-af75-1a64aba01c24";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin via auth header
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

    // Verify the token and check admin
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

    // Fetch all stats in parallel
    const [
      usersRes,
      widgetsRes,
      conversationsRes,
      messagesRes,
      topUsersRes,
      recentSignupsRes,
      activeWidgetsRes,
    ] = await Promise.all([
      // Total users
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      // Total widgets
      supabase.from("widget_configurations").select("id", { count: "exact", head: true }),
      // Total conversations
      supabase.from("conversations").select("id", { count: "exact", head: true }),
      // Total messages
      supabase.from("chat_messages").select("id", { count: "exact", head: true }),
      // Top users by AI responses
      supabase.rpc("match_training_chunks", { query_embedding: "", match_user_id: ADMIN_USER_ID }).maybeSingle(), // placeholder, we'll use raw query
      // Recent signups (last 7 days)
      supabase
        .from("profiles")
        .select("user_id, created_at")
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: false }),
      // Widgets with events (active)
      supabase
        .from("widget_events")
        .select("widget_id")
        .limit(1000),
    ]);

    // Get top users by AI responses using direct query via auth.users join
    const { data: topUsers } = await supabase.rpc("match_training_chunks", {
      query_embedding: "", match_user_id: ADMIN_USER_ID
    }).maybeSingle();

    // Manual top users query
    const { data: allConversations } = await supabase
      .from("conversations")
      .select("id, widget_owner_id, visitor_name")
      .order("last_message_at", { ascending: false })
      .limit(1000);

    const { data: allMessages } = await supabase
      .from("chat_messages")
      .select("conversation_id, is_ai_response, sender_type")
      .limit(5000);

    const { data: allWidgets } = await supabase
      .from("widget_configurations")
      .select("id, user_id, contact_name, website_url, chatbot_enabled");

    // Get user emails from auth
    const { data: authUsers } = await supabase.auth.admin.listUsers({ perPage: 1000 });

    // Build top users map
    const userStatsMap: Record<string, {
      email: string;
      contactName: string;
      websiteUrl: string | null;
      aiResponses: number;
      visitorMessages: number;
      conversations: number;
    }> = {};

    const widgetOwnerMap: Record<string, string> = {};
    allConversations?.forEach((c) => {
      widgetOwnerMap[c.id] = c.widget_owner_id;
    });

    // Count messages per owner
    allMessages?.forEach((m) => {
      const ownerId = widgetOwnerMap[m.conversation_id];
      if (!ownerId) return;
      if (!userStatsMap[ownerId]) {
        const widget = allWidgets?.find((w) => w.user_id === ownerId);
        const authUser = authUsers?.users?.find((u) => u.id === ownerId);
        userStatsMap[ownerId] = {
          email: authUser?.email || "unknown",
          contactName: widget?.contact_name || "—",
          websiteUrl: widget?.website_url || null,
          aiResponses: 0,
          visitorMessages: 0,
          conversations: 0,
        };
      }
      if (m.is_ai_response) userStatsMap[ownerId].aiResponses++;
      if (m.sender_type === "visitor") userStatsMap[ownerId].visitorMessages++;
    });

    // Count conversations per owner
    allConversations?.forEach((c) => {
      if (userStatsMap[c.widget_owner_id]) {
        userStatsMap[c.widget_owner_id].conversations++;
      }
    });

    const topUsersList = Object.entries(userStatsMap)
      .map(([userId, stats]) => ({ userId, ...stats }))
      .sort((a, b) => b.aiResponses - a.aiResponses)
      .slice(0, 20);

    // Count active widgets (unique widget_ids with events)
    const activeWidgetIds = new Set(activeWidgetsRes.data?.map((e) => e.widget_id) || []);

    // Signups per day (last 7 days)
    const signupsByDay: Record<string, number> = {};
    recentSignupsRes.data?.forEach((p) => {
      const day = p.created_at.split("T")[0];
      signupsByDay[day] = (signupsByDay[day] || 0) + 1;
    });

    const stats = {
      totalUsers: usersRes.count ?? 0,
      totalWidgets: widgetsRes.count ?? 0,
      totalConversations: conversationsRes.count ?? 0,
      totalMessages: messagesRes.count ?? 0,
      activeWidgets: activeWidgetIds.size,
      recentSignups: signupsByDay,
      topUsers: topUsersList,
      totalAuthUsers: authUsers?.users?.length ?? 0,
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
