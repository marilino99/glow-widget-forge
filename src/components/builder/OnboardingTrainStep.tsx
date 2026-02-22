import { useState, useEffect, useRef } from "react";
import { Link2, FileText, MessageCircleQuestion, FilePlus2, Globe, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface OnboardingTrainStepProps {
  onNext: () => void;
  onBack: () => void;
  totalSteps?: number;
  currentStep?: number;
  websiteUrl?: string;
}

type Tab = "url" | "document" | "faq";

const OnboardingTrainStep = ({
  onNext,
  onBack,
  totalSteps = 4,
  currentStep = 2,
  websiteUrl = "",
}: OnboardingTrainStepProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("url");
  const [pages, setPages] = useState<string[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
  const [isScanning, setIsScanning] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [displayedCount, setDisplayedCount] = useState(0);
  const allPagesRef = useRef<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start fetching pages when component mounts with a websiteUrl
  useEffect(() => {
    if (!websiteUrl) return;

    const fetchPages = async () => {
      setIsScanning(true);
      try {
        const { data, error } = await supabase.functions.invoke("scrape-sitemap", {
          body: { url: websiteUrl },
        });

        if (error || !data?.success) {
          console.error("Sitemap scrape failed:", error || data?.error);
          // Fallback: just add the URL itself
          const fallback = websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`;
          allPagesRef.current = [fallback];
        } else {
          allPagesRef.current = data.links || [];
        }

        // Animate pages appearing one by one
        setDisplayedCount(0);
        let idx = 0;
        timerRef.current = setInterval(() => {
          idx++;
          if (idx >= allPagesRef.current.length) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsScanning(false);
            setDisplayedCount(allPagesRef.current.length);
            setPages([...allPagesRef.current]);
            setSelectedPages(new Set(allPagesRef.current));
            return;
          }
          setDisplayedCount(idx);
          setPages(allPagesRef.current.slice(0, idx));
          setSelectedPages(new Set(allPagesRef.current.slice(0, idx)));
        }, 120);
      } catch (err) {
        console.error("Scrape error:", err);
        setIsScanning(false);
      }
    };

    fetchPages();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [websiteUrl]);

  const togglePage = (url: string) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedPages.size === pages.length) {
      setSelectedPages(new Set());
    } else {
      setSelectedPages(new Set(pages));
    }
  };

  const getPageLabel = (url: string) => {
    try {
      const u = new URL(url);
      return u.pathname === "/" ? "Homepage" : u.pathname.replace(/\/$/, "");
    } catch {
      return url;
    }
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "url", label: "Add website URL", icon: <Link2 className="h-4 w-4" /> },
    { key: "document", label: "Upload document", icon: <FileText className="h-4 w-4" /> },
    { key: "faq", label: "Add FAQs", icon: <MessageCircleQuestion className="h-4 w-4" /> },
  ];

  const hasPages = pages.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #f0f2ff 60%, #e8ecff 100%)",
      }}
    >
      {/* Stepper */}
      <div className="flex items-center justify-center pt-12 pb-8">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const stepNum = i + 1;
          const isActive = stepNum === currentStep;
          const isPast = stepNum < currentStep;
          return (
            <div key={i} className="flex items-center">
              {i > 0 && (
                <div
                  className="h-[2px] w-24"
                  style={{ backgroundColor: isPast ? "#7c3aed" : "#e5e7eb" }}
                />
              )}
              <div
                className="flex items-center justify-center rounded-full font-bold transition-all"
                style={{
                  width: isActive ? "40px" : "14px",
                  height: isActive ? "40px" : "14px",
                  backgroundColor: isActive ? "#7c3aed" : isPast ? "#7c3aed" : "#e5e7eb",
                  color: isActive ? "#fff" : "transparent",
                  fontSize: isActive ? "16px" : "0",
                }}
              >
                {isActive ? stepNum : ""}
              </div>
            </div>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col items-center px-6 pt-4 overflow-hidden">
        <h1 className="text-3xl font-bold text-[#1a1a2e] mb-4 text-center">
          Train your AI agent
        </h1>
        <p className="max-w-2xl text-center text-[#8a8fa8] text-base leading-relaxed mb-8">
          Upload your website, docs, PDFs, and knowledge base to train your AI
          agent. The more data sources, the smarter your chatbot. You can add or
          remove sources later.
        </p>

        {/* Tabs */}
        <div className="flex w-full max-w-3xl gap-3 mb-6">
          {tabs.map((tab) => {
            const isTabActive = activeTab === tab.key;
            const badge = tab.key === "url" && hasPages ? pages.length : null;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex flex-1 items-center justify-center gap-2.5 rounded-xl border-2 px-4 py-3.5 text-[14px] font-medium transition-all relative"
                style={{
                  backgroundColor: isTabActive ? "#f3f0ff" : "#fff",
                  borderColor: isTabActive ? "#7c3aed" : "#e0e3ef",
                  color: isTabActive ? "#7c3aed" : "#6a6f88",
                }}
              >
                {tab.icon}
                {tab.label}
                {badge !== null && (
                  <span className="ml-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#7c3aed] px-1.5 text-[11px] font-bold text-white">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content area */}
        {activeTab === "url" && (hasPages || isScanning) ? (
          <div className="flex w-full max-w-3xl flex-1 flex-col rounded-2xl bg-white border border-[#eaedf5] overflow-hidden min-h-0">
            {/* Header row */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#eaedf5] shrink-0">
              <div className="flex items-center gap-2">
                {hasPages && (
                  <button
                    onClick={toggleAll}
                    className="flex h-5 w-5 items-center justify-center rounded border-2 transition-colors"
                    style={{
                      borderColor: selectedPages.size === pages.length && pages.length > 0 ? "#7c3aed" : "#d1d5db",
                      backgroundColor: selectedPages.size === pages.length && pages.length > 0 ? "#7c3aed" : "transparent",
                    }}
                  >
                    {selectedPages.size === pages.length && pages.length > 0 && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </button>
                )}
                <span className="text-sm font-medium text-[#1a1a2e]">
                  {isScanning
                    ? `Scanning... ${pages.length} pages found`
                    : `${selectedPages.size} of ${pages.length} pages selected`}
                </span>
              </div>
              {isScanning && (
                <div className="flex items-center gap-2 text-[#7c3aed]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-xs font-medium">Fetching pages...</span>
                </div>
              )}
            </div>

            {/* Page list */}
            <div className="flex-1 overflow-y-auto px-2 py-2">
              {pages.map((pageUrl, index) => {
                const isSelected = selectedPages.has(pageUrl);
                const label = getPageLabel(pageUrl);
                return (
                  <div
                    key={pageUrl}
                    className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                    style={{ animationDelay: `${index * 40}ms`, animationFillMode: "backwards" }}
                  >
                    <button
                      onClick={() => togglePage(pageUrl)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[#f8f9fc]"
                    >
                      <div
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors"
                        style={{
                          borderColor: isSelected ? "#7c3aed" : "#d1d5db",
                          backgroundColor: isSelected ? "#7c3aed" : "transparent",
                        }}
                      >
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <Globe className="h-4 w-4 shrink-0 text-[#b0b4c8]" />
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-medium text-[#1a1a2e] truncate">
                          {label}
                        </span>
                        <span className="text-xs text-[#8a8fa8] truncate">
                          {pageUrl}
                        </span>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Empty state card */
          <div className="flex w-full max-w-3xl flex-1 items-center justify-center rounded-2xl bg-[#f8f9fc] border border-[#eaedf5] min-h-[280px]">
            <div className="flex flex-col items-center gap-3 text-center px-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white border border-[#eaedf5]">
                <FilePlus2 className="h-6 w-6 text-[#c0c4d8]" />
              </div>
              <p className="text-lg font-semibold text-[#1a1a2e]">
                Add your first training source
              </p>
              <p className="max-w-xs text-sm text-[#8a8fa8] leading-relaxed">
                Start by adding URLs, documents, and frequently asked questions.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-end gap-3 px-10 py-8">
        <button
          onClick={onBack}
          disabled={isTraining}
          className="rounded-xl border border-[#e0e3ef] bg-white px-8 py-3 text-[15px] font-semibold text-[#1a1a2e] transition-all hover:bg-[#f8f9fc] disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={async () => {
            if (selectedPages.size > 0 && !isTraining) {
              setIsTraining(true);
              try {
                await supabase.functions.invoke("scrape-training-content", {
                  body: { urls: Array.from(selectedPages) },
                });
              } catch (err) {
                console.error("Training scrape error:", err);
              }
              setIsTraining(false);
            }
            onNext();
          }}
          disabled={isTraining}
          className="rounded-xl bg-[#7c3aed] px-8 py-3 text-[15px] font-semibold text-white transition-all hover:bg-[#6d28d9] disabled:opacity-50 flex items-center gap-2"
        >
          {isTraining ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Training...
            </>
          ) : (
            "Next"
          )}
        </button>
      </div>
    </div>
  );
};

export default OnboardingTrainStep;
