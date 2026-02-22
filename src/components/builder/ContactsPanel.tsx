import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search,
  SlidersHorizontal,
  Upload,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Contact {
  id: string;
  user: string;
  email: string;
  channel: string;
  country: string;
  language: string;
  created: string;
}

const ContactsPanel = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const contacts: Contact[] = [];

  const columns = ["User", "Email", "Channel", "Country", "Language", "Created"];

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="shrink-0 border-b border-border px-8 py-6">
        <h1 className="text-xl font-semibold text-foreground">Contacts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A complete list of all contacts collected through your bot
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        {/* Search & Actions */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl border-border"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="rounded-xl gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
            <Button variant="outline" className="rounded-xl gap-2 text-muted-foreground">
              <Upload className="h-4 w-4" />
              Export all
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border overflow-hidden">
          {/* Table header */}
          <div className="flex items-center border-b border-border bg-muted/30 px-4 py-3">
            <div className="w-10 shrink-0">
              <Checkbox className="rounded" />
            </div>
            {columns.map((col) => (
              <div key={col} className="flex-1 text-sm font-medium text-foreground">
                {col}
              </div>
            ))}
          </div>

          {/* Table body */}
          {contacts.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">No data available</p>
            </div>
          ) : (
            contacts.map((contact) => (
              <div key={contact.id} className="flex items-center border-b border-border px-4 py-3 last:border-b-0 hover:bg-muted/20 transition-colors">
                <div className="w-10 shrink-0">
                  <Checkbox className="rounded" />
                </div>
                <div className="flex-1 text-sm text-foreground">{contact.user}</div>
                <div className="flex-1 text-sm text-muted-foreground">{contact.email}</div>
                <div className="flex-1 text-sm text-muted-foreground">{contact.channel}</div>
                <div className="flex-1 text-sm text-muted-foreground">{contact.country}</div>
                <div className="flex-1 text-sm text-muted-foreground">{contact.language}</div>
                <div className="flex-1 text-sm text-muted-foreground">{contact.created}</div>
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
              Page {currentPage} of 1
            </span>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl text-muted-foreground"
              disabled
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
