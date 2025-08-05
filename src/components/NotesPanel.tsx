import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useNotes, useSaveNote } from "@/hooks/useNotes";
import { useToast } from "@/hooks/use-toast";
import { FileText, Save } from "lucide-react";

interface NotesPanelProps {
  partnerId: string;
  partnerName: string;
  weekNumber: number;
  yearNum?: number;
}

export const NotesPanel = ({ partnerId, partnerName, weekNumber, yearNum = 2024 }: NotesPanelProps) => {
  const [content, setContent] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const { data: note, isLoading } = useNotes(partnerId, weekNumber, yearNum);
  const saveNote = useSaveNote();

  const handleOpen = () => {
    setContent(note?.content || "");
    setIsOpen(true);
  };

  const handleSave = async () => {
    try {
      await saveNote.mutateAsync({
        partnerId,
        weekNumber,
        yearNum,
        content,
      });
      toast({
        title: "Note saved",
        description: "Your note has been saved successfully.",
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save note. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleOpen}
          className="ml-2"
        >
          <FileText className="h-2 w-2 mr-1" />
          Notes
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>
            Notes - {partnerName} (Week {weekNumber})
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          <Textarea
            placeholder="Add your notes for this week..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[300px] resize-none"
            disabled={isLoading}
          />
          
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saveNote.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {saveNote.isPending ? "Saving..." : "Save Note"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};