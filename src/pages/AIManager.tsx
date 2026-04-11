import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft, Save, Loader2, RefreshCw, AlertTriangle,
  CheckCircle, Clock, MessageSquare, Mic, Filter,
} from "lucide-react";

const ADMIN_USER_ID = "43c72ef7-a716-4d7f-af75-1a64aba01c24";

interface AILog {
  id: string;
  conversationId: string;
  visitorMessage: string | null;
  aiResponse: string;
  responseTimeMs: number | null;
  isError: boolean;
  isSlow: boolean;
  errorDetail: string | null;
  createdAt: string;
  senderType: string;
  voiceMode: boolean;
}

const AIManager = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Instructions state
  const [chatInstructions, setChatInstructions] = useState("");
  const [voiceInstructions, setVoiceInstructions] = useState("");
  const [originalChat, setOriginalChat] = useState("");
  const [originalVoice, setOriginalVoice] = useState("");
  const [savingChat, setSavingChat] = useState(false);
  const [savingVoice, setSavingVoice] = useState(false);
  const [savedChat, setSavedChat] = useState(false);
  const [savedVoice, setSavedVoice] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [configId, setConfigId] = useState<string | null>(null);

  // Logs state
  const [logs, setLogs] = useState<AILog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [showErrorsOnly, setShowErrorsOnly] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!authLoading && (!user || user.id !== ADMIN_USER_ID)) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  // Load config
  useEffect(() => {
    if (user?.id === ADMIN_USER_ID) {
      loadConfig();
    }
  }, [user]);

  const loadConfig = async () => {
    setLoadingConfig(true);
    try {
      const { data, error } = await (supabase
        .from("widget_configurations") as any)
        .select("id, chatbot_instructions, voice_instructions")
        .eq("user_id", ADMIN_USER_ID)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setConfigId(data.id);
        setChatInstructions(data.chatbot_instructions || "");
        setVoiceInstructions(data.voice_instructions || "");
        setOriginalChat(data.chatbot_instructions || "");
        setOriginalVoice(data.voice_instructions || "");
      }
    } catch (e) {
      console.error("Error loading config:", e);
    } finally {
      setLoadingConfig(false);
    }
  };

  const saveInstructions = async (type: "chat" | "voice") => {
    const isChatType = type === "chat";
    const setter = isChatType ? setSavingChat : setSavingVoice;
    const savedSetter = isChatType ? setSavedChat : setSavedVoice;
    const field = isChatType ? "chatbot_instructions" : "voice_instructions";
    const value = isChatType ? chatInstructions : voiceInstructions;
    const originalSetter = isChatType ? setOriginalChat : setOriginalVoice;

    setter(true);
    try {
      const { error } = await (supabase
        .from("widget_configurations") as any)
        .update({ [field]: value })
        .eq("user_id", ADMIN_USER_ID);

      if (error) throw error;
      originalSetter(value);
      savedSetter(true);
      setTimeout(() => savedSetter(false), 2000);
      toast({ title: "Salvato!", description: `Istruzioni ${isChatType ? "chat" : "voce"} aggiornate.` });
    } catch (e) {
      console.error(e);
      toast({ title: "Errore", description: "Salvataggio fallito.", variant: "destructive" });
    } finally {
      setter(false);
    }
  };

  const fetchLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const url = `https://${projectId}.supabase.co/functions/v1/ai-logs?limit=50&errors=${showErrorsOnly}`;
      const session = (await supabase.auth.getSession()).data.session;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (e) {
      console.error("Error fetching logs:", e);
    } finally {
      setLoadingLogs(false);
    }
  }, [showErrorsOnly]);

  useEffect(() => {
    if (user?.id === ADMIN_USER_ID) {
      fetchLogs();
    }
  }, [user, showErrorsOnly]);

  if (authLoading || !user || user.id !== ADMIN_USER_ID) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const chatDirty = chatInstructions !== originalChat;
  const voiceDirty = voiceInstructions !== originalVoice;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/builder")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI Manager</h1>
            <p className="text-sm text-muted-foreground">
              Gestisci le istruzioni del chatbot e monitora i log
            </p>
          </div>
        </div>

        <Tabs defaultValue="instructions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="instructions" className="gap-2">
              <MessageSquare className="h-4 w-4" /> Istruzioni
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-2">
              <AlertTriangle className="h-4 w-4" /> Log & Errori
            </TabsTrigger>
          </TabsList>

          {/* INSTRUCTIONS TAB */}
          <TabsContent value="instructions" className="space-y-6">
            {loadingConfig ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {/* Chat Instructions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      Istruzioni Chat
                    </CardTitle>
                    <CardDescription>
                      Le istruzioni che l'AI segue quando risponde via chat testuale.
                      Scrivi in linguaggio naturale cosa deve fare, come deve rispondere, il tono da usare.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Textarea
                      value={chatInstructions}
                      onChange={(e) => setChatInstructions(e.target.value)}
                      placeholder="Es: Rispondi sempre in italiano. Sei l'assistente di [nome azienda]. Non inventare informazioni che non hai..."
                      className="min-h-[200px] font-mono text-sm"
                    />
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={() => saveInstructions("chat")}
                        disabled={savingChat || !chatDirty}
                        className="gap-2"
                      >
                        {savingChat ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : savedChat ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        {savedChat ? "Salvato!" : "Salva istruzioni chat"}
                      </Button>
                      {chatDirty && (
                        <span className="text-xs text-amber-500">Modifiche non salvate</span>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Voice Instructions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Mic className="h-5 w-5 text-primary" />
                      Istruzioni Voce
                    </CardTitle>
                    <CardDescription>
                      Istruzioni specifiche per quando l'utente usa la modalità voce.
                      Es: risposte più brevi, tono conversazionale, evita elenchi.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Textarea
                      value={voiceInstructions}
                      onChange={(e) => setVoiceInstructions(e.target.value)}
                      placeholder="Es: Rispondi in modo conciso, massimo 2 frasi. Usa un tono amichevole e naturale..."
                      className="min-h-[200px] font-mono text-sm"
                    />
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={() => saveInstructions("voice")}
                        disabled={savingVoice || !voiceDirty}
                        className="gap-2"
                      >
                        {savingVoice ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : savedVoice ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        {savedVoice ? "Salvato!" : "Salva istruzioni voce"}
                      </Button>
                      {voiceDirty && (
                        <span className="text-xs text-amber-500">Modifiche non salvate</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* LOGS TAB */}
          <TabsContent value="logs" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant={showErrorsOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowErrorsOnly(!showErrorsOnly)}
                  className="gap-2"
                >
                  <Filter className="h-4 w-4" />
                  {showErrorsOnly ? "Solo errori/lenti" : "Tutti i log"}
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchLogs}
                disabled={loadingLogs}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loadingLogs ? "animate-spin" : ""}`} />
                Aggiorna
              </Button>
            </div>

            {loadingLogs ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : logs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  {showErrorsOnly
                    ? "Nessun errore o risposta lenta trovata 🎉"
                    : "Nessun log disponibile"}
                </CardContent>
              </Card>
            ) : (
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {logs.map((log) => (
                    <Card key={log.id} className={`${log.isError ? "border-destructive/50 bg-destructive/5" : log.isSlow ? "border-amber-500/50 bg-amber-500/5" : ""}`}>
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {log.voiceMode ? (
                              <Mic className="h-4 w-4 text-primary" />
                            ) : (
                              <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="text-xs text-muted-foreground">
                              {new Date(log.createdAt).toLocaleString("it-IT")}
                            </span>
                            {log.isError && (
                              <Badge variant="destructive" className="text-xs">Errore</Badge>
                            )}
                            {log.isSlow && !log.isError && (
                              <Badge variant="secondary" className="text-xs bg-amber-500/20 text-amber-700">
                                Lento
                              </Badge>
                            )}
                            {log.voiceMode && (
                              <Badge variant="outline" className="text-xs">Voce</Badge>
                            )}
                          </div>
                          {log.responseTimeMs && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {(log.responseTimeMs / 1000).toFixed(1)}s
                            </div>
                          )}
                        </div>

                        {log.visitorMessage && (
                          <div className="rounded-md bg-muted/50 p-2">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Visitatore:</p>
                            <p className="text-sm">{log.visitorMessage}</p>
                          </div>
                        )}

                        <div className="rounded-md bg-primary/5 p-2">
                          <p className="text-xs font-medium text-muted-foreground mb-1">AI:</p>
                          <p className="text-sm">{log.aiResponse}</p>
                        </div>

                        {log.errorDetail && (
                          <div className="rounded-md bg-destructive/10 p-2">
                            <p className="text-xs font-mono text-destructive">{log.errorDetail}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AIManager;
