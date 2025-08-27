import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotes, useSaveNote } from "@/hooks/useNotes";
import { useToast } from "@/hooks/use-toast";
import { FileText, Save, Calendar, Copy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface NotesPanelProps {
  partnerId: string;
  partnerName: string;
  weekNumber: number;
  yearNum?: number;
}

// --- types for lightweight history hook ---
type NoteRow = {
  id: string;
  partner_id: string;
  week_number: number;
  year_num: number;
  content: string | null;
  updated_at: string | null;
  created_at: string | null;
};

const currentYear = new Date().getFullYear();

// fetch past notes for this partner/year
function useNotesHistory(partnerId: string, yearNum: number) {
  return useQuery({
    queryKey: ["notesHistory", partnerId, yearNum],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("id, partner_id, week_number, year_num, content, updated_at, created_at")
        .eq("partner_id", partnerId)
        .eq("year_num", yearNum)
        .order("week_number", { ascending: false });

      if (error) throw error;
      return (data || []) as NoteRow[];
    },
    enabled: Boolean(partnerId) && Boolean(yearNum),
  });
}

export const NotesPanel = ({
  partnerId,
  partnerName,
  weekNumber,
  yearNum = currentYear,
}: NotesPanelProps) => {
  const [content, setContent] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"this" | "history">("this");
  const [search, setSearch] = useState("");
  const [previewId, setPreviewId] = useState<string | null>(null);

  const { toast } = useToast();

  const { data: note, isLoading: loadingCurrent } = useNotes(
    partnerId,
    weekNumber,
    yearNum
  );

  const saveNote = useSaveNote();

  const {
    data: history = [],
    isLoading: loadingHistory,
    isError: historyError,
  } = useNotesHistory(partnerId, yearNum);

  const handleOpen = () => {
    setContent(note?.content || "");
    setActiveTab("this");
    setIsOpen(true);
  };

  useEffect(() => {
    if (isOpen && !content && note?.content) {
      setContent(note.content);
    }
  }, [isOpen, note?.content]);

  const handleSave = async () => {
    try {
      await saveNote.mutateAsync({ partnerId, weekNumber, yearNum, content });
      toast({ title: "Note saved", description: "Your note has been saved successfully." });
      setIsOpen(false);
    } catch {
      toast({
        title: "Error",
        description: "Failed to save note. Please try again.",
        variant: "destructive",
      });
    }
  };

  const prettyDate = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleString() : "—";

  const filteredHistory = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = history.filter((n) => n.week_number !== weekNumber); 
    if (!q) return base;
    return base.filter((n) => (n.content || "").toLowerCase().includes(q));
  }, [history, search, weekNumber]);

  const selectedPreview =
    previewId ? history.find((h) => h.id === previewId) ?? null : null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button variant="outline" size="sm" onClick={handleOpen} className="ml-2">
        <FileText className="h-4 w-4 mr-1" />
        Notes
      </Button>

      <DialogContent className="max-w-[900px] w-full p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-lg">
            Notes — {partnerName} (Week {weekNumber}, {yearNum})
          </DialogTitle>
          <DialogDescription className="sr-only">
            View and edit this week’s notes and browse previous weeks.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "this" | "history")} className="px-6">
          <TabsList className="mb-4">
            <TabsTrigger value="this">This week</TabsTrigger>
            <TabsTrigger value="history" disabled={historyError}>
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="this" className="space-y-3">
            <div className="text-xs text-muted-foreground">
              Last saved: {prettyDate(note?.updated_at)}
            </div>
            <Textarea
              placeholder="Add your notes for this week..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[260px] resize-none"
              disabled={loadingCurrent || saveNote.isPending}
            />

            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const last = history.find((h) => h.week_number < weekNumber);
                  if (last?.content) {
                    setContent((prev) => (prev ? prev + "\n\n" + last.content : last.content!));
                    toast({
                      title: "Inserted",
                      description: `Copied content from week ${last.week_number}.`,
                    });
                  }
                }}
                disabled={loadingHistory || history.length === 0}
              >
                <Copy className="h-4 w-4 mr-2" /> Insert last week
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)} disabled={saveNote.isPending}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saveNote.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {saveNote.isPending ? "Saving..." : "Save Note"}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4">
              <div className="border rounded-lg">
                <div className="p-3 border-b">
                  <Input
                    placeholder="Search past notes…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    disabled={loadingHistory}
                  />
                </div>
                <ScrollArea className="h-[320px]">
                  <div className="p-2">
                    {loadingHistory && (
                      <div className="text-sm text-muted-foreground p-2">Loading…</div>
                    )}
                    {!loadingHistory && filteredHistory.length === 0 && (
                      <div className="text-sm text-muted-foreground p-2">
                        No past notes found.
                      </div>
                    )}
                    {filteredHistory.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => setPreviewId(n.id)}
                        className={`w-full text-left px-3 py-2 rounded-md hover:bg-accent ${
                          previewId === n.id ? "bg-accent" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Calendar className="h-3.5 w-3.5" />
                          Week {n.week_number}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Updated {prettyDate(n.updated_at)}
                        </div>
                        <div className="line-clamp-2 text-xs mt-1">
                          {(n.content || "").trim() || "—"}
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="border rounded-lg p-3 min-h-[320px]">
                {!previewId ? (
                  <div className="text-sm text-muted-foreground p-2">
                    Select a past note to preview.
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-semibold">
                        Week {selectedPreview?.week_number}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Updated {prettyDate(selectedPreview?.updated_at)}
                      </div>
                    </div>
                    <div className="rounded bg-muted/40 p-3 text-sm whitespace-pre-wrap">
                      {(selectedPreview?.content || "").trim() || "—"}
                    </div>
                    <div className="flex justify-end mt-3">
                      <Button
                        size="sm"
                        onClick={() => {
                          const text = (selectedPreview?.content || "").trim();
                          if (!text) return;
                          setContent((prev) => (prev ? prev + "\n\n" + text : text));
                          setActiveTab("this");
                          toast({
                            title: "Inserted",
                            description: "Copied into this week’s editor.",
                          });
                        }}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Insert into editor
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="px-6 pb-6" />
      </DialogContent>
    </Dialog>
  );
};
