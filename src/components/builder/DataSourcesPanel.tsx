import { useState, useEffect, useMemo, useRef } from "react";
import { Search, Plus, FolderOpen, MoreVertical, FileText, Link2, SlidersHorizontal, HelpCircle, Trash2, RefreshCw, Upload, MessageSquareText, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface TrainingSource {
  id: string;
  title: string;
  url: string | null;
  source_type: string;
  status: string;
  content: string;
  created_at: string;
  updated_at: string;
}

type AddMode = "url" | "text" | "upload" | "picker" | null;

interface DataSourcesPanelProps {
  onNavigateToFaq?: () => void;
}

const DataSourcesPanel = ({ onNavigateToFaq }: DataSourcesPanelProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sources, setSources] = useState<TrainingSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [addMode, setAddMode] = useState<AddMode>(null);
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load sources
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("training_sources")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (!error && data) setSources(data);
      setIsLoading(false);
    };
    load();
  }, [user]);

  // Derive folders from URLs
  const folders = useMemo(() => {
    const map = new Map<string, number>();
    sources.forEach((s) => {
      if (s.url) {
        try {
          const host = new URL(s.url).hostname.replace("www.", "");
          map.set(host, (map.get(host) || 0) + 1);
        } catch {}
      }
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [sources]);

  // Filtered sources
  const filtered = useMemo(() => {
    let list = sources;
    if (selectedFolder) {
      list = list.filter((s) => {
        if (!s.url) return false;
        try {
          return new URL(s.url).hostname.replace("www.", "") === selectedFolder;
        } catch {
          return false;
        }
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          (s.url && s.url.toLowerCase().includes(q))
      );
    }
    return list;
  }, [sources, selectedFolder, searchQuery]);

  const getFolder = (url: string | null) => {
    if (!url) return "—";
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return "—";
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
      ", " +
      d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  };

  const handleAddUrl = async () => {
    if (!user || !newUrl.trim()) return;
    setIsAdding(true);
    const formattedUrl = newUrl.startsWith("http") ? newUrl : `https://${newUrl}`;
    let title = newUrl;
    try { title = new URL(formattedUrl).pathname.split("/").pop() || new URL(formattedUrl).hostname; } catch {}

    const { data, error } = await supabase
      .from("training_sources")
      .insert({ user_id: user.id, url: formattedUrl, title, source_type: "url", status: "pending", content: "" })
      .select()
      .single();

    if (!error && data) {
      setSources((prev) => [data, ...prev]);
      // Trigger scraping in background
      supabase.functions.invoke("scrape-training-content", { body: { urls: [formattedUrl] } }).then(({ error: scrapeErr }) => {
        if (!scrapeErr) {
          setSources((prev) => prev.map((s) => s.id === data.id ? { ...s, status: "trained" } : s));
          // Generate RAG embeddings in background
          supabase.functions.invoke("generate-embeddings", { body: { sourceId: data.id } }).catch(console.error);
        }
      });
      toast({ title: "Source added", description: "The URL is being processed." });
    } else {
      toast({ title: "Error", description: "Failed to add source.", variant: "destructive" });
    }
    setNewUrl("");
    setAddMode(null);
    setIsAdding(false);
  };

  const handleAddText = async () => {
    if (!user || !newTitle.trim() || !newContent.trim()) return;
    setIsAdding(true);
    const { data, error } = await supabase
      .from("training_sources")
      .insert({ user_id: user.id, title: newTitle, source_type: "text", status: "trained", content: newContent })
      .select()
      .single();

    if (!error && data) {
      setSources((prev) => [data, ...prev]);
      toast({ title: "Source added" });
      // Generate RAG embeddings in background
      supabase.functions.invoke("generate-embeddings", { body: { sourceId: data.id } }).catch(console.error);
    } else {
      toast({ title: "Error", description: "Failed to add source.", variant: "destructive" });
    }
    setNewTitle("");
    setNewContent("");
    setAddMode(null);
    setIsAdding(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await supabase.from("training_sources").delete().eq("id", deleteId);
    setSources((prev) => prev.filter((s) => s.id !== deleteId));
    setDeleteId(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "text/markdown",
      "text/csv",
    ];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|txt|md|csv)$/i)) {
      toast({ title: "Unsupported file type", description: "Please upload PDF, DOC, DOCX, TXT, MD, or CSV files.", variant: "destructive" });
      return;
    }

    // Validate size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 20MB.", variant: "destructive" });
      return;
    }

    setUploadingFile(true);
    setAddMode(null);

    try {
      const filePath = `${user.id}/${Date.now()}_${file.name}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("training-documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Determine source type label
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      const sourceType = ext === "pdf" ? "pdf" : ext === "doc" || ext === "docx" ? "doc" : "text";

      // Create training source entry
      const { data, error: insertError } = await supabase
        .from("training_sources")
        .insert({
          user_id: user.id,
          title: file.name,
          source_type: sourceType,
          status: "pending",
          content: "",
          url: filePath,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setSources((prev) => [data, ...prev]);
      toast({ title: "Document uploaded", description: "Processing content..." });

      // Trigger parsing in background
      supabase.functions.invoke("parse-document", {
        body: { sourceId: data.id, filePath },
      }).then(({ error: parseErr }) => {
        if (!parseErr) {
          setSources((prev) =>
            prev.map((s) => s.id === data.id ? { ...s, status: "trained" } : s)
          );
          // Generate RAG embeddings in background
          supabase.functions.invoke("generate-embeddings", { body: { sourceId: data.id } }).catch(console.error);
        } else {
          setSources((prev) =>
            prev.map((s) => s.id === data.id ? { ...s, status: "error" } : s)
          );
        }
      });
    } catch (err) {
      console.error("Upload error:", err);
      toast({ title: "Upload failed", description: "Could not upload the document.", variant: "destructive" });
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };


  return (
    <div className="flex h-full">
      {/* Left sidebar - Folders: hidden on mobile unless toggled */}
      <div className={`${showMobileSidebar ? "flex" : "hidden"} lg:flex w-full lg:w-56 shrink-0 border-r border-border bg-[#fafbfc] flex-col`}>
        <div className="px-5 pt-6 pb-4">
          <h2 className="text-lg font-bold text-foreground">Training</h2>
        </div>
        <div className="px-3 space-y-0.5">
          <button
            onClick={() => { setSelectedFolder(null); setShowMobileSidebar(false); }}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
              !selectedFolder ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
            }`}
          >
            <FileText className="h-4 w-4" />
            All sources
          </button>
          <button
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <HelpCircle className="h-4 w-4" />
            Unanswered questions
          </button>
        </div>

        {folders.length > 0 && (
          <div className="mt-6 px-3">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Folders</span>
              <button className="text-muted-foreground hover:text-foreground">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="space-y-0.5">
              {folders.map(([domain, count]) => (
                <button
                  key={domain}
                  onClick={() => { setSelectedFolder(selectedFolder === domain ? null : domain); setShowMobileSidebar(false); }}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors ${
                    selectedFolder === domain
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <FolderOpen className="h-4 w-4 shrink-0" />
                  <span className="flex-1 truncate text-left">{domain}</span>
                  <span className="text-xs text-muted-foreground">{count}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main content - hidden on mobile when sidebar is showing */}
      <div className={`${showMobileSidebar ? "hidden" : "flex"} lg:flex flex-1 flex-col min-w-0`}>
        {/* Header */}
        <div className="shrink-0 px-5 lg:px-8 pt-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => setShowMobileSidebar(true)} className="lg:hidden rounded-md p-1 text-muted-foreground hover:bg-muted/50 transition-colors">
                <FolderOpen className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">All sources</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Widjet will use the knowledge you add here to answer customer questions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search + Filter bar */}
        <div className="shrink-0 px-5 lg:px-8 pb-4 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by keyword"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl border-border"
            />
          </div>
          <Button variant="outline" size="sm" className="rounded-xl gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </Button>
        </div>

        {/* Sources count + Add button */}
        <div className="shrink-0 px-8 pb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            All sources: {filtered.length}
          </span>
          <Button size="sm" className="rounded-xl gap-2" onClick={() => setAddMode("picker")}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto px-8 pb-6">
          <div className="rounded-xl border border-border overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_140px_100px_160px_40px] items-center gap-2 bg-muted/30 px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
              <span>Title</span>
              <span>Folder</span>
              <span>Status</span>
              <span>Last Trained</span>
              <span />
            </div>

            {uploadingFile && (
              <div className="px-4 py-3 border-b border-border bg-primary/5 flex items-center gap-2 text-sm text-primary">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Uploading document...
              </div>
            )}

            {isLoading ? (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                Loading sources...
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                {searchQuery ? "No sources match your search." : "No sources yet. Add a URL or text to train your chatbot."}
              </div>
            ) : (
              filtered.map((source) => (
                <div
                  key={source.id}
                  className="grid grid-cols-[1fr_140px_100px_160px_40px] items-center gap-2 px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors"
                >
                  {/* Title + icon */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      source.source_type === "url"
                        ? "bg-purple-100 text-purple-600"
                        : source.source_type === "pdf"
                        ? "bg-red-100 text-red-600"
                        : source.source_type === "doc"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-amber-100 text-amber-600"
                    }`}>
                      {source.source_type === "url" ? (
                        <Link2 className="h-4 w-4" />
                      ) : source.source_type === "pdf" ? (
                        <Upload className="h-4 w-4" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{source.title}</p>
                      {source.source_type === "url" && source.url && (
                        <p className="text-xs text-muted-foreground truncate">{source.url}</p>
                      )}
                      {source.source_type === "pdf" && (
                        <p className="text-xs text-muted-foreground">PDF document</p>
                      )}
                      {source.source_type === "doc" && (
                        <p className="text-xs text-muted-foreground">Word document</p>
                      )}
                      {source.source_type === "text" && (
                        <p className="text-xs text-muted-foreground">Text document</p>
                      )}
                    </div>
                  </div>

                  {/* Folder */}
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    {source.url ? (
                      <>
                        <FolderOpen className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{getFolder(source.url)}</span>
                      </>
                    ) : (
                      <span>—</span>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    {source.status === "trained" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Trained
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        Pending
                      </span>
                    )}
                  </div>

                  {/* Last trained */}
                  <span className="text-sm text-muted-foreground">
                    {formatDate(source.updated_at)}
                  </span>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem
                        onClick={() => setDeleteId(source.id)}
                        className="gap-2 text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add knowledge picker dialog */}
      <Dialog open={addMode === "picker"} onOpenChange={(open) => !open && setAddMode(null)}>
        <DialogContent className="rounded-2xl sm:max-w-2xl p-0">
          <div className="flex items-start justify-between px-6 pt-6 pb-2">
            <div>
              <DialogTitle className="text-xl font-bold text-foreground">Add more knowledge</DialogTitle>
              <DialogDescription className="mt-1">
                Choose how you want to provide Widjet with knowledge.
              </DialogDescription>
            </div>
          </div>
          <div className="border-t border-border" />
          <div className="grid grid-cols-2 gap-4 p-6">
            {/* Add website URL */}
            <button
              onClick={() => setAddMode("url")}
              className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-background p-5 text-left transition-all hover:border-primary/30 hover:shadow-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                <Link2 className="h-5 w-5 text-indigo-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Add website URL</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Let Widjet scan your website and learn from its content
                </p>
              </div>
            </button>

            {/* Create article */}
            <button
              onClick={() => setAddMode("text")}
              className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-background p-5 text-left transition-all hover:border-primary/30 hover:shadow-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                <FileText className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Create article</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Write custom help content for smarter answers
                </p>
              </div>
            </button>

            {/* Upload document */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-background p-5 text-left transition-all hover:border-primary/30 hover:shadow-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50">
                <Upload className="h-5 w-5 text-pink-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Upload document</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Upload files to turn docs into support data
                </p>
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,.md,.csv"
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Add FAQ's */}
            <button
              onClick={() => { setAddMode(null); onNavigateToFaq?.(); }}
              className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-background p-5 text-left transition-all hover:border-primary/30 hover:shadow-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                <MessageSquareText className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Add FAQ's</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Add short question–answer pairs for quick replies
                </p>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add URL dialog */}
      <Dialog open={addMode === "url"} onOpenChange={(open) => !open && setAddMode(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add website URL</DialogTitle>
            <DialogDescription>Enter a URL to scrape and add to your knowledge base.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label>URL</Label>
            <Input
              placeholder="https://example.com/page"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMode("picker")} className="rounded-xl">Back</Button>
            <Button onClick={handleAddUrl} disabled={isAdding || !newUrl.trim()} className="rounded-xl">
              {isAdding ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Text dialog */}
      <Dialog open={addMode === "text"} onOpenChange={(open) => !open && setAddMode(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Create article</DialogTitle>
            <DialogDescription>Write custom help content for smarter answers.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Title</Label>
              <Input
                placeholder="e.g. Return Policy"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="rounded-xl mt-1"
              />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea
                placeholder="Paste or type your content here..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="rounded-xl mt-1 min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMode("picker")} className="rounded-xl">Back</Button>
            <Button onClick={handleAddText} disabled={isAdding || !newTitle.trim() || !newContent.trim()} className="rounded-xl">
              {isAdding ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete source</DialogTitle>
            <DialogDescription>Are you sure? This will permanently remove this training source.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} className="rounded-xl">Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} className="rounded-xl">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DataSourcesPanel;
