import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Upload, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface Contact {
  id: string;
  name: string | null;
  email: string;
  channel: string | null;
  country: string | null;
  language: string | null;
  created_at: string;
}

const PAGE_SIZE = 20;

const ContactsPanel = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    const fetchContacts = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("contacts")
        .select("id, name, email, channel, country, language, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setContacts((data as Contact[]) || []);
      setLoading(false);
    };
    fetchContacts();
  }, [user]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    const q = searchQuery.toLowerCase();
    return contacts.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.country?.toLowerCase().includes(q)
    );
  }, [contacts, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === paged.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paged.map((c) => c.id)));
    }
  };

  const handleDelete = async () => {
    if (selectedIds.size === 0) return;
    await supabase.from("contacts").delete().in("id", Array.from(selectedIds));
    setContacts((prev) => prev.filter((c) => !selectedIds.has(c.id)));
    setSelectedIds(new Set());
  };

  const handleExport = () => {
    const rows = [["Name", "Email", "Channel", "Country", "Language", "Created"]];
    for (const c of filtered) {
      rows.push([
        c.name || "",
        c.email,
        c.channel || "",
        c.country || "",
        c.language || "",
        c.created_at ? format(new Date(c.created_at), "yyyy-MM-dd") : "",
      ]);
    }
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contacts.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = ["Name", "Email", "Channel", "Country", "Language", "Created"];

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="shrink-0 border-b border-border px-8 py-6">
        <h1 className="text-xl font-semibold text-foreground">Contacts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {filtered.length} contact{filtered.length !== 1 ? "s" : ""} collected through your bot
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        {/* Search & Actions */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email or country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl border-border"
            />
          </div>
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <Button variant="destructive" className="rounded-xl gap-2" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
                Delete ({selectedIds.size})
              </Button>
            )}
            <Button variant="outline" className="rounded-xl gap-2 text-muted-foreground" onClick={handleExport} disabled={filtered.length === 0}>
              <Upload className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border overflow-hidden">
          {/* Table header */}
          <div className="flex items-center border-b border-border bg-muted/30 px-4 py-3">
            <div className="w-10 shrink-0">
              <Checkbox className="rounded" checked={paged.length > 0 && selectedIds.size === paged.length} onCheckedChange={toggleAll} />
            </div>
            {columns.map((col) => (
              <div key={col} className="flex-1 text-sm font-medium text-foreground">
                {col}
              </div>
            ))}
          </div>

          {/* Table body */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          ) : paged.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">No contacts yet</p>
            </div>
          ) : (
            paged.map((contact) => (
              <div key={contact.id} className="flex items-center border-b border-border px-4 py-3 last:border-b-0 hover:bg-muted/20 transition-colors">
                <div className="w-10 shrink-0">
                  <Checkbox className="rounded" checked={selectedIds.has(contact.id)} onCheckedChange={() => toggleSelect(contact.id)} />
                </div>
                <div className="flex-1 text-sm text-foreground">{contact.name || "—"}</div>
                <div className="flex-1 text-sm text-muted-foreground">{contact.email}</div>
                <div className="flex-1 text-sm text-muted-foreground">{contact.channel || "—"}</div>
                <div className="flex-1 text-sm text-muted-foreground">{contact.country || "—"}</div>
                <div className="flex-1 text-sm text-muted-foreground">{contact.language || "—"}</div>
                <div className="flex-1 text-sm text-muted-foreground">
                  {contact.created_at ? format(new Date(contact.created_at), "MMM d, yyyy") : "—"}
                </div>
              </div>
            ))
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl text-muted-foreground"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl text-muted-foreground"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactsPanel;
